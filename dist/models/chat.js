"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_TYPE_CHOICES = exports.Message = exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("./utils");
const handlers_1 = require("../config/handlers");
var CHAT_TYPE_CHOICES;
(function (CHAT_TYPE_CHOICES) {
    CHAT_TYPE_CHOICES["DM"] = "DM";
    CHAT_TYPE_CHOICES["GROUP"] = "GROUP";
})(CHAT_TYPE_CHOICES || (exports.CHAT_TYPE_CHOICES = CHAT_TYPE_CHOICES = {}));
// Create the Chat Schema
const ChatSchema = new mongoose_1.Schema({
    name: { type: String, required: false, default: null, maxlength: 50 }, // For Group name
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    cType: { type: String, enum: CHAT_TYPE_CHOICES, required: true, default: CHAT_TYPE_CHOICES.DM },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }], // Users who are members of the group.
    description: { type: String, required: false, default: null, maxlength: 100 }, // For Group description
    image: { type: mongoose_1.Schema.Types.ObjectId, ref: 'File', required: false, default: null }, // For Group image
}, { timestamps: true });
ChatSchema.virtual('imageUrl').get(function () {
    return (0, utils_1.getFileUrl)(this.image, "chats");
});
ChatSchema.methods.toString = function () {
    return this.id;
};
ChatSchema.pre('save', async function (next) {
    let cType = this.cType;
    let name = this.name;
    if (cType === CHAT_TYPE_CHOICES.DM && (name || this.description || this.image))
        return next(new handlers_1.RequestError('DMs cannot have name, image and description', 403, handlers_1.ErrorCode.NOT_ALLOWED));
    if (cType === CHAT_TYPE_CHOICES.GROUP && !name)
        return next(new handlers_1.RequestError('Enter name for group chat', 403, handlers_1.ErrorCode.NOT_ALLOWED));
});
ChatSchema.virtual('latestMessage', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chat',
    justOne: true, // We only want the latest message
    options: {
        sort: { createdAt: -1 }, // Sort by creation date in descending order
    },
});
// Create the Chat model
const Chat = (0, mongoose_1.model)('Chat', ChatSchema);
exports.Chat = Chat;
// Create the Message Schema
const MessageSchema = new mongoose_1.Schema({
    chat: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: false, default: null },
    file: { type: mongoose_1.Schema.Types.ObjectId, ref: 'File', required: false, default: null },
}, { timestamps: true });
MessageSchema.virtual('fileUrl').get(function () {
    return (0, utils_1.getFileUrl)(this.file, "messages");
});
MessageSchema.virtual('chatId').get(function () {
    return this.chat.toString();
});
MessageSchema.methods.toString = function () {
    return this.id;
};
MessageSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Update the chat so that the updated timestamp gets updated
        await Chat.updateOne({ _id: this.chat }, {});
        next();
    }
});
// Create the Message model
const Message = (0, mongoose_1.model)('Message', MessageSchema);
exports.Message = Message;
//# sourceMappingURL=chat.js.map