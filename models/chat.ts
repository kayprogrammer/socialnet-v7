import { model, Schema, Types } from "mongoose";
import { IUser } from "./accounts";
import { IFile } from "./base";
import { getFileUrl } from "./utils";
import { ErrorCode, RequestError } from "../config/handlers";

enum CHAT_TYPE_CHOICES {
    DM = "DM",
    GROUP = "GROUP"
}
interface IChat {
    name: string | null;
    owner: Types.ObjectId | IUser;
    cType: CHAT_TYPE_CHOICES;
    users: Types.ObjectId[] | IUser[];
    description: string | null;
    image: Types.ObjectId | IFile | null; 
    imageUrl: string | null;
}

// Create the Chat Schema
const ChatSchema = new Schema<IChat>({
    name: { type: String, required: false, default: null, maxlength: 500 }, // For Group name
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cType: { type: String, enum: CHAT_TYPE_CHOICES, required: true, default: CHAT_TYPE_CHOICES.DM },
    users: [{type: Schema.Types.ObjectId, ref: 'User', required: true }], // Users who are members of the group.
    description: { type: String, required: false, default: null, maxlength: 500 }, // For Group description
    image: { type: Schema.Types.ObjectId, ref: 'File', required: false, default: null }, // For Group image
}, {timestamps: true})

ChatSchema.virtual('imageUrl').get(function(this: IChat) {
    return getFileUrl(this.image, "chats")
});

ChatSchema.pre('save', async function (next) {
    let cType = this.cType;
    if (cType === CHAT_TYPE_CHOICES.DM && (this.name || this.description || this.image)) return next(new RequestError('DMs cannot have name, image and description', 403, ErrorCode.NOT_ALLOWED));
    if (cType === CHAT_TYPE_CHOICES.GROUP && !this.name) return next(new RequestError('Enter name for group chat', 403, ErrorCode.NOT_ALLOWED));
}) 
// Create the Chat model
const Chat = model<IChat>('Chat', ChatSchema);


interface IMessage {
    chat: Types.ObjectId | IChat;
    sender: Types.ObjectId | IUser;
    text: string;
    file: Types.ObjectId | IFile | null;
    fileUrl: string | null;
}

// Create the Message Schema
const MessageSchema = new Schema<IMessage>({
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: false, default: null },
    file: { type: Schema.Types.ObjectId, ref: 'File', required: false, default: null },
}, {timestamps: true})

MessageSchema.virtual('fileUrl').get(function(this: IMessage) {
    return getFileUrl(this.file, "messages")
});

MessageSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Update the chat so that the updated timestamp gets updated
        await Chat.updateOne({ _id: this.chat })
        next()
    }
}) 

// Create the Message model
const Message = model<IMessage>('Message', MessageSchema);

export { Chat, IChat, Message, IMessage }