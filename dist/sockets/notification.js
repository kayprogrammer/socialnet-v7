"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationInSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const config_1 = __importDefault(require("../config/config"));
const base_1 = require("./base");
const handlers_1 = require("../config/handlers");
const profiles_1 = require("../models/profiles");
const profiles_2 = require("../schemas/profiles");
const utils_1 = require("../config/utils");
// Function to broadcast a notification to the right receivers
const broadcastToNotificationReceivers = (notification, message) => {
    base_1.notificationClients.forEach((client) => {
        const clientUser = client.user;
        const notificationReceiver = notification.receiver;
        // Only send the message to clients who are true receivers of the notification
        if (clientUser && (notificationReceiver.toString() == clientUser?.id?.toString() || notification.nType === profiles_1.NOTIFICATION_TYPE_CHOICES.ADMIN)) {
            client.send(message);
        }
    });
    return true;
};
// WebSocket connection handler for notifications
const notificationSocket = async (ws, req) => {
    const socketSecret = config_1.default.SOCKET_SECRET;
    if (ws.user !== socketSecret)
        (0, base_1.addClient)(ws);
    ws.on('message', async (msg) => {
        const user = ws.user;
        if (user !== socketSecret)
            return (0, base_1.WSError)(ws, 4001, handlers_1.ErrorCode.NOT_ALLOWED, "Permissible only to in-app clients");
        const data = await (0, base_1.validateSocketEntry)(ws, msg, base_1.SocketEntrySchema);
        const notification = await profiles_1.Notification.findOne({ _id: data.id });
        if (!notification)
            return (0, base_1.WSError)(ws, 4004, handlers_1.ErrorCode.NON_EXISTENT, "Notification does not exist");
        const broadcasted = broadcastToNotificationReceivers(notification, msg);
        if (broadcasted && data.status === base_1.SOCKET_STATUS_CHOICES.DELETED)
            await notification.deleteOne();
    });
    ws.on('close', () => {
        (0, base_1.removeClient)(ws);
        console.log('Notification WebSocket disconnected');
    });
};
const sendNotificationInSocket = (secured, host, notification, status = base_1.SOCKET_STATUS_CHOICES.CREATED) => {
    if (config_1.default.NODE_ENV === "test")
        return;
    const websocketScheme = secured ? "wss://" : "ws://";
    const websocketUri = `${websocketScheme}${host}/api/v7/ws/notifications`;
    let notificationData = { id: notification.id.toString(), status: status, nType: notification.nType };
    if (status === base_1.SOCKET_STATUS_CHOICES.CREATED) {
        // Set necessary notification values
        notificationData = { status, ...(0, utils_1.convertSchemaData)(profiles_2.NotificationSchema, notification) };
    }
    const socket = new ws_1.default(websocketUri, { headers: { Authorization: config_1.default.SOCKET_SECRET } });
    socket.on("open", () => {
        socket.send(JSON.stringify(notificationData));
    });
};
exports.sendNotificationInSocket = sendNotificationInSocket;
exports.default = notificationSocket;
//# sourceMappingURL=notification.js.map