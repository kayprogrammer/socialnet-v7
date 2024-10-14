import { NextFunction, Request, Response, Router } from "express";
import { paginateModel } from "../config/paginator";
import { Chat, CHAT_TYPE_CHOICES, IChat, Message } from "../models/chat";
import { CustomResponse } from "../config/utils";
import { shortUserPopulation } from "../managers/users";
import { ChatsResponseSchema, GroupChatInputResponseSchema, GroupCreateSchema, GroupUpdateSchema, MessageSentResponseSchema, MessagesResponseSchema, SendMessageSchema, UpdateMessageSchema } from "../schemas/chats";
import { validationMiddleware } from "../middlewares/error";
import { User } from "../models/accounts";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { File, IFile } from "../models/base";
import FileProcessor from "../config/file_processors";
import { handleGroupUsersAddOrRemove } from "../managers/chats";
import { sendMessageDeletionInSocket } from "../sockets/chat";

const chatsRouter = Router();

/**
 * @route GET /
 * @description Get Chats.
 */
chatsRouter.get('', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const filterDoc = { $or: [{ owner: user._id }, { users: { $in: [user._id] } }] } // To fetch chat based on ownership or membership
        const populateDoc = [shortUserPopulation("owner"), "image", {path: "latestMessage", populate: shortUserPopulation("sender")}]
        const data = await paginateModel(req, Chat, filterDoc, populateDoc)
        let chatsData = { chats: data.items, ...data }
        delete chatsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Chats fetched', 
                chatsData, 
                ChatsResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /
 * @description Send message.
 */
chatsRouter.post('', validationMiddleware(SendMessageSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { chatId, username, text, fileType } = req.body;
        // Ensure chatId or username was entered and ensure a text or a fileType is entered
        if (!chatId && !username) throw new ValidationErr("chatId", "You must enter a chat id or username")
        if (chatId && username) throw new ValidationErr("username", "Can't enter username when chatId is set")
        if (!text && !fileType) throw new ValidationErr("text", "You must enter a text or fileType")

        let chat = null
        if (!chatId) {
            // Create a new chat dm with current user and recipient user
            const recipient = await User.findOne({ username })
            if(!recipient) throw new ValidationErr("username", "No user with that username")
            // Check if a chat already exists between both users
            chat = await Chat.findOne({ 
                cType: CHAT_TYPE_CHOICES.DM, 
                $or: [
                    { owner: user._id, users: { $in: [recipient._id] } }, 
                    { owner: recipient._id, users: { $in: [user._id] } }
                ] 
            })
            if (!chat) {
                chat = await Chat.create({ owner: user._id, users: [recipient._id] })
            } 
        } else {
            // Get the chat with chat id and check if the current user is the owner or the recipient
            chat = await Chat.findOne({ _id: chatId, $or: [{ owner: user._id }, { users: { $in: [user._id] } }] })
            if (!chat) throw new ValidationErr("chatId", "User has no chat with that ID")
        }
        // Create message
        let file = null
        if (fileType) file = await File.create({ resourceType: fileType })
        const message = await Message.create({ sender: user.id, chat: chat.id, file: file?.id, text })
        message.sender = user
        if (file) message.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "messages")
        return res.status(201).json(
            CustomResponse.success(
                "Message sent", 
                message,
                MessageSentResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /:id
 * @description Get Chat messages.
 */
chatsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const id = req.params.id
        const filterDoc = { _id: id, $or: [{ owner: user._id }, { users: { $in: [user._id] } }] } // To fetch chat based on ownership or membership
        const populateDoc = [shortUserPopulation("owner"), "image", {path: "latestMessage", populate: shortUserPopulation("sender")}]
        const chat = await Chat.findOne(filterDoc).populate(populateDoc)
        if (!chat) throw new NotFoundError("User has no chat with that ID")
        const users = await User.find({ _id: { $in: chat.users } }).populate("avatar")
        const messagesData = await paginateModel(req, Message, { chat: chat._id }, [shortUserPopulation("sender"), "file"])
        const data = { chat, messages: messagesData, users }
        return res.status(200).json(
            CustomResponse.success(
                'Messages fetched', 
                data, 
                MessagesResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route PATCH /:id
 * @description Update Group chat.
 */
chatsRouter.patch('/:id', validationMiddleware(GroupUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let chat = await Chat.findOne({ _id: req.params.id, owner: user._id, cType: CHAT_TYPE_CHOICES.GROUP }).populate([shortUserPopulation("users"), "image"])        
        if (!chat) throw new NotFoundError("User owns no group chat with that ID")
        const { name, description, usernamesToAdd, usernamesToRemove, fileType } = req.body;
        // Prevent matching items in usernamesToAdd and usernamesToRemove
        if(usernamesToAdd && usernamesToRemove) {
            const matchingUsernames = usernamesToRemove.filter((username: string) =>  usernamesToAdd.includes(username))
            if (matchingUsernames.length !== 0) throw new ValidationErr("usernamesToRemove", "Must not have any matching items with usernames to add")
        }
        chat = await handleGroupUsersAddOrRemove(chat, usernamesToAdd, usernamesToRemove)
        
        // Handle File Upload
        let image = null
        if (fileType) {
            image = chat.image as IFile
            if (image) {
                image.resourceType = fileType
                await image.save()
            } else {
                image = await File.create({ resourceType: fileType })   
            }
            chat.image = image._id
        }

        // Set other fields and save
        if (name) chat.name = name
        if (description) chat.description = description
        await chat.save()

        // Set file upload data for the client
        if (image) chat.fileUploadData = FileProcessor.generateFileSignature(image.id.toString(), "chats")
        chat.image = image // For imageUrl virtual
        return res.status(200).json(
            CustomResponse.success(
                "Group chat updated", 
                chat,
                GroupChatInputResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /:id
 * @description Delete Group chat.
 */
chatsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const chat = await Chat.findOneAndDelete({ _id: req.params.id, owner: user._id, cType: CHAT_TYPE_CHOICES.GROUP })
        if (!chat) throw new NotFoundError("User owns no group chat with that ID")
        return res.status(200).json(CustomResponse.success("Group chat deleted"))
    } catch (error) {
        next(error)
    }
});

/**
 * @route PUT /messages/:id
 * @description Update Message.
 */
chatsRouter.put('/messages/:id', validationMiddleware(UpdateMessageSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const message = await Message.findOne({ _id: req.params.id, sender: user._id }).populate([shortUserPopulation("sender"), "file"])
        if (!message) throw new NotFoundError("User has no message with that ID")
        const { text, fileType } = req.body;
        if (!text && !fileType) throw new ValidationErr("text", "You must enter a text or fileType")

        // Handle File Upload
        let file = null
        if (fileType) {
            file = message.file as IFile
            if (file) {
                file.resourceType = fileType
                await file.save()
            } else {
                file = await File.create({ resourceType: fileType })   
            }
            message.file = file._id
        }

        // Set other fields and save
        if (text) message.text = text
        await message.save()

        // Set file upload data for the client
        if (file) message.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "messages")
        message.file = file // For fileUrl virtual
        return res.status(200).json(
            CustomResponse.success(
                "Message updated", 
                message,
                MessageSentResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /messages/:id
 * @description Delete Message.
 */
chatsRouter.delete('/messages/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const message = await Message.findOne({ _id: req.params.id, sender: user._id }).populate("chat")
        if (!message) throw new NotFoundError("User has no message with that ID")
        const chat = message.chat as IChat
        const chatId = chat._id
        const messagesCount = await Message.countDocuments({ chat: chatId })

        sendMessageDeletionInSocket(req.secure, req.get("host") as string, chat.toString(), message._id.toString())

        // Delete message and chat if its the last message in the dm being deleted
        if (messagesCount == 1 && chat.cType == CHAT_TYPE_CHOICES.DM) {
            await chat.deleteOne()
        }
        await message.deleteOne()
        return res.status(200).json(CustomResponse.success("Message deleted"))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /:id
 * @description Create Group chat.
 */
chatsRouter.post('/groups/group', validationMiddleware(GroupCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { name, description, usernamesToAdd, fileType } = req.body;
        const usersToAdd = await User.find({ username: { $in: usernamesToAdd }, _id: { $ne: user._id } })
        if (usersToAdd.length < 1) throw new ValidationErr("usernamesToAdd", "Enter at least one valid username")
        const userIDsToAdd = usersToAdd.map(user => user._id)

        // Handle File Upload
        let file = null
        if (fileType) file = await File.create({ resourceType: fileType })
        
        const groupChat = await Chat.create({ owner: user.id, name: name, description: description, file: file?.id, users: userIDsToAdd, cType: CHAT_TYPE_CHOICES.GROUP })
        groupChat.users = usersToAdd // To display in response
        if (file) groupChat.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "chats")
        return res.status(201).json(
            CustomResponse.success(
                "Group chat created", 
                groupChat,
                GroupChatInputResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

export default chatsRouter