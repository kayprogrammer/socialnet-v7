"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageDeletionInSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const accounts_1 = require("../models/accounts");
const chat_1 = require("../models/chat");
const config_1 = __importDefault(require("../config/config"));
const base_1 = require("./base");
const handlers_1 = require("../config/handlers");
const mongoose_1 = require("mongoose");
const chats_1 = require("../schemas/chats");
const users_1 = require("../managers/users");
const utils_1 = require("../config/utils");
const getUserAndChat = async (id, user) => {
    // Retrieve a chat or user based on ID in the path (ID can be chatId or username)
    let chat = null;
    let objUser = null;
    if (user.toString() !== id) {
        if (mongoose_1.Types.ObjectId.isValid(id))
            chat = await chat_1.Chat.findOne({ _id: id });
        if (!chat)
            objUser = await accounts_1.User.findOne({ username: id });
    }
    else {
        objUser = user;
    }
    return [chat, objUser];
};
const validateChatMembership = async (ws, id, user) => {
    user = user;
    const userId = user._id;
    const [chat, objUser] = await getUserAndChat(id, user);
    if (user.toString() !== config_1.default.SOCKET_SECRET) {
        if (!chat && !objUser)
            return [null, null, (0, base_1.WSError)(ws, 1001, handlers_1.ErrorCode.INVALID_PARAM, "ID is invalid")];
        if (chat && !chat.users.includes(userId) && userId.toString() !== chat.owner.toString())
            return [null, null, (0, base_1.WSError)(ws, 1001, handlers_1.ErrorCode.INVALID_MEMBER, "You're not a member of this chat")];
    }
    ws.objUser = objUser;
    ws.chat = chat;
    return [chat, objUser, false];
};
// Function to broadcast a message to all clients in the same chat
const broadcastToChat = (chat, objUser, message) => {
    base_1.chatClients.forEach((client) => {
        // Retrieve the chat and objUser associated with the WebSocket client
        const clientChat = client.chat;
        const user = client.user;
        // Only send the message to clients who are part of the same chat
        const clientChatBool = clientChat && chat && clientChat.toString() === chat.toString();
        const clientUserBool = objUser && objUser.toString() === user.toString();
        if (clientChatBool || clientUserBool) {
            client.send(message);
        }
    });
};
// WebSocket connection handler for chats
const chatSocket = async (ws, req) => {
    const user = ws.user;
    const [chat, objUser, _] = await validateChatMembership(ws, req.params.id, user);
    if (user !== config_1.default.SOCKET_SECRET)
        (0, base_1.addClient)(ws, "chat");
    ws.on('message', async (msg) => {
        const user = ws.user;
        const data = await (0, base_1.validateSocketEntry)(ws, msg, base_1.SocketEntrySchema);
        // Validate message ownership
        if (user !== config_1.default.SOCKET_SECRET) {
            if (data.status === base_1.SOCKET_STATUS_CHOICES.DELETED) {
                // Only in app client can handle this
                return (0, base_1.WSError)(ws, 4001, handlers_1.ErrorCode.NOT_ALLOWED, "Permissible only to in-app clients");
            }
            // Validate message and set necessary data
            const message = await chat_1.Message.findOne({ _id: data.id, sender: user._id }).populate([(0, users_1.shortUserPopulation)("sender"), "file"]);
            if (!message)
                return (0, base_1.WSError)(ws, 4003, handlers_1.ErrorCode.INVALID_OWNER, "You don't have a message with that ID");
            // Set necessary message values
            const messageData = { status: data.status, ...(0, utils_1.convertSchemaData)(chats_1.MessageSchema, message) };
            msg = JSON.stringify(messageData);
        }
        broadcastToChat(chat, objUser, msg);
    });
    ws.on('close', () => {
        (0, base_1.removeClient)(ws, "chat");
        console.log('Chat WebSocket disconnected');
    });
};
const sendMessageDeletionInSocket = (secured, host, chatId, messageId) => {
    if (config_1.default.NODE_ENV === "test")
        return;
    const websocketScheme = secured ? "wss://" : "ws://";
    const websocketUri = `${websocketScheme}${host}/api/v7/ws/chats/${chatId}`;
    const socket = new ws_1.default(websocketUri, { headers: { Authorization: config_1.default.SOCKET_SECRET } });
    socket.on("open", () => {
        socket.send(JSON.stringify({ id: messageId, status: base_1.SOCKET_STATUS_CHOICES.DELETED }));
    });
};
exports.sendMessageDeletionInSocket = sendMessageDeletionInSocket;
exports.default = chatSocket;
//# sourceMappingURL=chat.js.map