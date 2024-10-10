import { NextFunction, Request, Response, Router } from "express";
import { paginateModel } from "../config/paginator";
import { Chat, CHAT_TYPE_CHOICES, Message } from "../models/chat";
import { CustomResponse } from "../config/utils";
import { shortUserPopulation } from "../managers/users";
import { ChatSchema, ChatsResponseSchema, MessageSentResponseSchema, MessagesResponseSchema, SendMessageSchema } from "../schemas/chats";
import { validationMiddleware } from "../middlewares/error";
import { IUser, User } from "../models/accounts";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { File } from "../models/base";
import FileProcessor from "../config/file_processors";
import { Types } from "mongoose";

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
 * @description Get Chats.
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
export default chatsRouter