import { Request } from "express";
import { WebSocket } from 'ws';
import WebSocketClient from "ws";
import { IUser } from "../models/accounts";
import ENV from "../config/config";
import { addClient, notificationClients, removeClient, SOCKET_STATUS_CHOICES, SocketEntrySchema, validateSocketEntry, WSError } from "./base";
import { ErrorCode } from "../config/handlers";
import { Types } from "mongoose";
import { INotification, Notification, NOTIFICATION_TYPE_CHOICES } from "../models/profiles";
import { plainToInstance } from "class-transformer";
import { NotificationSchema } from "../schemas/profiles";

// Function to broadcast a notification to the right receivers
const broadcastToNotificationReceivers = (notification: INotification, message: string): boolean => {
    notificationClients.forEach((client: WebSocket) => {
        const clientUser = client.user as IUser;
        const notificationReceiver = notification.receiver as Types.ObjectId
        // Only send the message to clients who are true receivers of the notification
        if (clientUser && (notificationReceiver.toString() == clientUser?.id?.toString() || notification.nType === NOTIFICATION_TYPE_CHOICES.ADMIN)) {
            client.send(message);
        }
    });
    return true
};

// WebSocket connection handler for notifications
const notificationSocket = async (ws: WebSocket, req: Request) => {
    const socketSecret = ENV.SOCKET_SECRET
    if (ws.user !== socketSecret) addClient(ws)
    ws.on('message', async (msg: string) => {
        const user = ws.user
        if (user !== socketSecret) WSError(ws, 4001, ErrorCode.NOT_ALLOWED, "Permissible only to in-app clients")
        const data = await validateSocketEntry(ws, msg, SocketEntrySchema)
        const notification = await Notification.findOne({ _id: data.id })
        if (!notification) WSError(ws, 4004, ErrorCode.NON_EXISTENT, "Notification does not exist")
        const broadcasted = broadcastToNotificationReceivers(notification as INotification, msg)
        if (broadcasted && data.status === SOCKET_STATUS_CHOICES.DELETED) await (notification as INotification).deleteOne()
    });
  
    ws.on('close', () => {
      removeClient(ws)
      console.log('Notification WebSocket disconnected');
    });
}

export const sendNotificationInSocket = (secured: boolean, host: string, notification: INotification, status: SOCKET_STATUS_CHOICES = SOCKET_STATUS_CHOICES.CREATED) => {
    const websocketScheme = secured ? "wss://" : "ws://"
    const websocketUri = `${websocketScheme}${host}/api/v7/ws/notifications`
    let notificationData = { id: notification.id.toString(), status: status, nType: notification.nType }
    if ( status === SOCKET_STATUS_CHOICES.CREATED ) {
        // Set necessary notification values
        notificationData = {status, ...plainToInstance(NotificationSchema, notification, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        }) as any}
    }
    
    const socket = new WebSocketClient(websocketUri, { headers: { Authorization: ENV.SOCKET_SECRET } })
    socket.on("open", () => {
        socket.send(JSON.stringify(notificationData))
    })
}

export default notificationSocket