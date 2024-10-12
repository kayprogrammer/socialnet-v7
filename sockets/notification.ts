import { Request } from "express";
import { WebSocket } from 'ws';
import { IUser } from "../models/accounts";
import ENV from "../config/config";
import { addClient, notificationClients, removeClient, validateSocketEntry, WSError } from "./base";
import { ErrorCode } from "../config/handlers";
import { Types } from "mongoose";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { INotification, Notification, NOTIFICATION_TYPE_CHOICES } from "../models/profiles";

export class SocketMessageSchema {
    @Expose()
    @IsNotEmpty()
    status?: "CREATED" | "UPDATED" | "DELETED";

    @IsNotEmpty()
    @Expose()
    id?: string;
}

// Function to broadcast a notification to the right receivers
const broadcastToNotificationReceivers = (notification: INotification, message: string) => {
    notificationClients.forEach((client: WebSocket) => {
        const clientUser = client.user as IUser;
        const notificationReceiver = notification.receiver as Types.ObjectId
        // Only send the message to clients who are true receivers of the notification
        if (clientUser && (notificationReceiver.toString() == clientUser?.id?.toString() || notification.nType === NOTIFICATION_TYPE_CHOICES.ADMIN)) {
            client.send(message);
        }
    });
};

// WebSocket connection handler for notifications
const notificationSocket = async (ws: WebSocket, req: Request) => {
    const socketSecret = ENV.SOCKET_SECRET
    if (ws.user !== socketSecret) addClient(ws)
    ws.on('message', async (msg: string) => {
        const user = ws.user
        if (user !== socketSecret) WSError(ws, 4001, ErrorCode.NOT_ALLOWED, "Permissible only to in-app clients")
        const data = await validateSocketEntry(ws, msg, SocketMessageSchema)
        const notification = await Notification.findOne({ _id: data.id })
        if (!notification) WSError(ws, 4004, ErrorCode.NON_EXISTENT, "Notification does not exist")
        broadcastToNotificationReceivers(notification as INotification, msg)
    });
  
    ws.on('close', () => {
      removeClient(ws)
      console.log('Notification WebSocket disconnected');
    });
}

export default notificationSocket