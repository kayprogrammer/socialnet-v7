import { Request } from "express";
import { WebSocket } from 'ws';
import { IUser, User } from "../models/accounts";
import { Chat, IChat, Message } from "../models/chat";
import ENV from "../config/config";
import { addClient, chatClients, removeClient, validateSocketEntry, WSError } from "./base";
import { ErrorCode } from "../config/handlers";
import { Types } from "mongoose";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";


const getUserAndChat = async (id: string, user: IUser): Promise<[IChat | null, IUser | null]> => {
    // Retrieve a chat or user based on ID in the path (ID can be chatId or username)
    let chat = null
    let objUser = null
    if (user.id.toString() !== id) {
        if (Types.ObjectId.isValid(id)) chat = await Chat.findOne({ _id: id })
        if (!chat) objUser = await User.findOne({ username: id })
        
    } else {
        objUser = user
    }
    return [chat, objUser]
}

const validateChatMembership = async (ws: WebSocket, id: string, user: IUser | string) => {
    if (user !== ENV.SOCKET_SECRET) {
        user = user as IUser
        const userId = user._id
        const [chat, objUser] = await getUserAndChat(id, user)
        if (!chat && !objUser) WSError(ws, 1001, ErrorCode.INVALID_PARAM, "ID is invalid")
        if (chat && !(chat.users as Types.ObjectId[]).includes(userId) && userId.toString() !== chat.owner.toString()) WSError(ws, 1001, ErrorCode.INVALID_MEMBER, "You're not a member of this chat")
        ws.objUser = objUser
        ws.chat = chat
    }
}

export class SocketMessageSchema {
    @Expose()
    @IsNotEmpty()
    status?: "CREATED" | "UPDATED" | "DELETED";

    @IsNotEmpty()
    @Expose()
    id?: string;
}

// Function to broadcast a message to all clients in the same chat
const broadcastToChat = (chatID: string, objUser: IUser | null, message: string) => {
    chatClients.forEach((client: WebSocket) => {
        // Retrieve the chat and objUser associated with the WebSocket client
        const clientChat = client.chat;
        const clientObjUser = client.objUser;

        // Only send the message to clients who are part of the same chat
        if (clientChat && clientChat.id.toString() === chatID.toString()) {
            client.send(message);
        }
        if (clientObjUser && objUser && clientObjUser?._id?.toString() === objUser._id.toString()) {
            client.send(message);
        }
    });
};

// WebSocket connection handler for chats
const chatSocket = async (ws: WebSocket, req: Request) => {
    const user = ws.user
    await validateChatMembership(ws, req.params.id, user)
    if (user !== ENV.SOCKET_SECRET) addClient(ws, "chat")
    ws.on('message', async (msg: string) => {
        const user = ws.user
        const objUser = ws.objUser
        const chat = ws.chat
        const data = await validateSocketEntry(ws, msg, SocketMessageSchema)
        // Validate message ownership
        if (user !== ENV.SOCKET_SECRET) {
            if (!(await Message.findOne({ _id: data.id, sender: (user as IUser)._id }))) WSError(ws, 4003, ErrorCode.INVALID_OWNER, "Message isn't yours")
            if (data.status === "DELETED") {
                // Only in app client can handle this
                WSError(ws, 4001, ErrorCode.NOT_ALLOWED, "Permissible only to in-app clients")
            }
        }
        
        if ((user as IUser)._id.toString() == objUser?._id.toString()) {
            ws.send(msg)
        } else {
            broadcastToChat(chat?.id, objUser, msg)
        }
    });
  
    ws.on('close', () => {
      removeClient(ws, "chat")
      console.log('Chat WebSocket disconnected');
    });
}

export default chatSocket