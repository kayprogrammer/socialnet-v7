"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paginator_1 = require("../config/paginator");
const chat_1 = require("../models/chat");
const utils_1 = require("../config/utils");
const users_1 = require("../managers/users");
const chats_1 = require("../schemas/chats");
const error_1 = require("../middlewares/error");
const accounts_1 = require("../models/accounts");
const handlers_1 = require("../config/handlers");
const base_1 = require("../models/base");
const file_processors_1 = __importDefault(require("../config/file_processors"));
const chats_2 = require("../managers/chats");
const chat_2 = require("../sockets/chat");
const chatsRouter = (0, express_1.Router)();
/**
 * @route GET /
 * @description Get Chats.
 */
chatsRouter.get('', async (req, res, next) => {
    try {
        const user = req.user;
        const filterDoc = { $or: [{ owner: user._id }, { users: { $in: [user._id] } }] }; // To fetch chat based on ownership or membership
        const populateDoc = [(0, users_1.shortUserPopulation)("owner"), "image", { path: "latestMessage", populate: (0, users_1.shortUserPopulation)("sender") }];
        const data = await (0, paginator_1.paginateModel)(req, chat_1.Chat, filterDoc, populateDoc);
        let chatsData = { chats: data.items, ...data };
        delete chatsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Chats fetched', chatsData, chats_1.ChatsResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /
 * @description Send message.
 */
chatsRouter.post('', (0, error_1.validationMiddleware)(chats_1.SendMessageSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { chatId, username, text, fileType } = req.body;
        // Ensure chatId or username was entered and ensure a text or a fileType is entered
        if (!chatId && !username)
            throw new handlers_1.ValidationErr("chatId", "You must enter a chat id or username");
        if (chatId && username)
            throw new handlers_1.ValidationErr("username", "Can't enter username when chatId is set");
        if (!text && !fileType)
            throw new handlers_1.ValidationErr("text", "You must enter a text or fileType");
        let chat = null;
        if (!chatId) {
            // Create a new chat dm with current user and recipient user
            const recipient = await accounts_1.User.findOne({ username });
            if (!recipient)
                throw new handlers_1.ValidationErr("username", "No user with that username");
            // Check if a chat already exists between both users
            chat = await chat_1.Chat.findOne({
                cType: chat_1.CHAT_TYPE_CHOICES.DM,
                $or: [
                    { owner: user._id, users: { $in: [recipient._id] } },
                    { owner: recipient._id, users: { $in: [user._id] } }
                ]
            });
            if (!chat) {
                chat = await chat_1.Chat.create({ owner: user._id, users: [recipient._id] });
            }
        }
        else {
            // Get the chat with chat id and check if the current user is the owner or the recipient
            chat = await chat_1.Chat.findOne({ _id: chatId, $or: [{ owner: user._id }, { users: { $in: [user._id] } }] });
            if (!chat)
                throw new handlers_1.ValidationErr("chatId", "User has no chat with that ID");
        }
        // Create message
        let file = null;
        if (fileType)
            file = await base_1.File.create({ resourceType: fileType });
        const message = await chat_1.Message.create({ sender: user.id, chat: chat.id, file: file?.id, text });
        message.sender = user;
        if (file)
            message.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "messages");
        return res.status(201).json(utils_1.CustomResponse.success("Message sent", message, chats_1.MessageSentResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /:id
 * @description Get Chat messages.
 */
chatsRouter.get('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const filterDoc = { _id: id, $or: [{ owner: user._id }, { users: { $in: [user._id] } }] }; // To fetch chat based on ownership or membership
        const populateDoc = [(0, users_1.shortUserPopulation)("owner"), "image", { path: "latestMessage", populate: (0, users_1.shortUserPopulation)("sender") }];
        const chat = await chat_1.Chat.findOne(filterDoc).populate(populateDoc);
        if (!chat)
            throw new handlers_1.NotFoundError("User has no chat with that ID");
        const users = await accounts_1.User.find({ _id: { $in: chat.users } }).populate("avatar");
        const messagesData = await (0, paginator_1.paginateModel)(req, chat_1.Message, { chat: chat._id }, [(0, users_1.shortUserPopulation)("sender"), "file"]);
        const data = { chat, messages: messagesData, users };
        return res.status(200).json(utils_1.CustomResponse.success('Messages fetched', data, chats_1.MessagesResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PATCH /:id
 * @description Update Group chat.
 */
chatsRouter.patch('/:id', (0, error_1.validationMiddleware)(chats_1.GroupUpdateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        let chat = await chat_1.Chat.findOne({ _id: req.params.id, owner: user._id, cType: chat_1.CHAT_TYPE_CHOICES.GROUP }).populate([(0, users_1.shortUserPopulation)("users"), "image"]);
        if (!chat)
            throw new handlers_1.NotFoundError("User owns no group chat with that ID");
        const { name, description, usernamesToAdd, usernamesToRemove, fileType } = req.body;
        // Prevent matching items in usernamesToAdd and usernamesToRemove
        if (usernamesToAdd && usernamesToRemove) {
            const matchingUsernames = usernamesToRemove.filter((username) => usernamesToAdd.includes(username));
            if (matchingUsernames.length !== 0)
                throw new handlers_1.ValidationErr("usernamesToRemove", "Must not have any matching items with usernames to add");
        }
        chat = await (0, chats_2.handleGroupUsersAddOrRemove)(chat, usernamesToAdd, usernamesToRemove);
        // Handle File Upload
        let image = null;
        if (fileType) {
            image = chat.image;
            if (image) {
                image.resourceType = fileType;
                await image.save();
            }
            else {
                image = await base_1.File.create({ resourceType: fileType });
            }
            chat.image = image._id;
        }
        // Set other fields and save
        if (name)
            chat.name = name;
        if (description)
            chat.description = description;
        await chat.save();
        // Set file upload data for the client
        if (image)
            chat.fileUploadData = file_processors_1.default.generateFileSignature(image.id.toString(), "chats");
        chat.image = image; // For imageUrl virtual
        return res.status(200).json(utils_1.CustomResponse.success("Group chat updated", chat, chats_1.GroupChatInputResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /:id
 * @description Delete Group chat.
 */
chatsRouter.delete('/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const chat = await chat_1.Chat.findOneAndDelete({ _id: req.params.id, owner: user._id, cType: chat_1.CHAT_TYPE_CHOICES.GROUP });
        if (!chat)
            throw new handlers_1.NotFoundError("User owns no group chat with that ID");
        return res.status(200).json(utils_1.CustomResponse.success("Group chat deleted"));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /messages/:id
 * @description Update Message.
 */
chatsRouter.put('/messages/:id', (0, error_1.validationMiddleware)(chats_1.UpdateMessageSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const message = await chat_1.Message.findOne({ _id: req.params.id, sender: user._id }).populate([(0, users_1.shortUserPopulation)("sender"), "file"]);
        if (!message)
            throw new handlers_1.NotFoundError("User has no message with that ID");
        const { text, fileType } = req.body;
        if (!text && !fileType)
            throw new handlers_1.ValidationErr("text", "You must enter a text or fileType");
        // Handle File Upload
        let file = null;
        if (fileType) {
            file = message.file;
            if (file) {
                file.resourceType = fileType;
                await file.save();
            }
            else {
                file = await base_1.File.create({ resourceType: fileType });
            }
            message.file = file._id;
        }
        // Set other fields and save
        if (text)
            message.text = text;
        await message.save();
        // Set file upload data for the client
        if (file)
            message.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "messages");
        message.file = file; // For fileUrl virtual
        return res.status(200).json(utils_1.CustomResponse.success("Message updated", message, chats_1.MessageSentResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /messages/:id
 * @description Delete Message.
 */
chatsRouter.delete('/messages/:id', async (req, res, next) => {
    try {
        const user = req.user;
        const message = await chat_1.Message.findOne({ _id: req.params.id, sender: user._id }).populate("chat");
        if (!message)
            throw new handlers_1.NotFoundError("User has no message with that ID");
        const chat = message.chat;
        const chatId = chat._id;
        const messagesCount = await chat_1.Message.countDocuments({ chat: chatId });
        (0, chat_2.sendMessageDeletionInSocket)(req.secure, req.get("host"), chat.toString(), message._id.toString());
        // Delete message and chat if its the last message in the dm being deleted
        if (messagesCount == 1 && chat.cType == chat_1.CHAT_TYPE_CHOICES.DM) {
            await chat.deleteOne();
        }
        await message.deleteOne();
        return res.status(200).json(utils_1.CustomResponse.success("Message deleted"));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /:id
 * @description Create Group chat.
 */
chatsRouter.post('/groups/group', (0, error_1.validationMiddleware)(chats_1.GroupCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { name, description, usernamesToAdd, fileType } = req.body;
        const usersToAdd = await accounts_1.User.find({ username: { $in: usernamesToAdd }, _id: { $ne: user._id } });
        if (usersToAdd.length < 1)
            throw new handlers_1.ValidationErr("usernamesToAdd", "Enter at least one valid username");
        const userIDsToAdd = usersToAdd.map(user => user._id);
        // Handle File Upload
        let file = null;
        if (fileType)
            file = await base_1.File.create({ resourceType: fileType });
        const groupChat = await chat_1.Chat.create({ owner: user.id, name: name, description: description, file: file?.id, users: userIDsToAdd, cType: chat_1.CHAT_TYPE_CHOICES.GROUP });
        groupChat.users = usersToAdd; // To display in response
        if (file)
            groupChat.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "chats");
        return res.status(201).json(utils_1.CustomResponse.success("Group chat created", groupChat, chats_1.GroupChatInputResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
exports.default = chatsRouter;
//# sourceMappingURL=chats.js.map