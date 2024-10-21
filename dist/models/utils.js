"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationPostSlug = exports.getNotificationMessage = exports.getFileUrl = exports.randomStringGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const file_processors_1 = __importDefault(require("../config/file_processors"));
const profiles_1 = require("./profiles");
// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length) => {
    return crypto_1.default.randomBytes(length).toString('hex').slice(0, length);
};
exports.randomStringGenerator = randomStringGenerator;
const getFileUrl = (file, folder) => {
    let url = null;
    if (file) {
        file = file;
        url = file_processors_1.default.generateFileUrl(file._id.toString(), folder, file.resourceType);
    }
    return url;
};
exports.getFileUrl = getFileUrl;
const getNotificationMessage = (obj) => {
    // This function returns a notification message
    const nType = obj.nType;
    const sender = obj.sender?.name;
    let message = `${sender} reacted to your post`;
    if (nType === profiles_1.NOTIFICATION_TYPE_CHOICES.REACTION) {
        if (obj.comment !== null)
            message = `${sender} reacted to your comment`;
        else if (obj.reply !== null)
            message = `${sender} reacted to your reply`;
    }
    else if (nType === profiles_1.NOTIFICATION_TYPE_CHOICES.COMMENT) {
        message = `${sender} commented on your post`;
    }
    else if (nType === profiles_1.NOTIFICATION_TYPE_CHOICES.REPLY)
        message = `${sender} replied your comment`;
    return message;
};
exports.getNotificationMessage = getNotificationMessage;
const getNotificationPostSlug = (post, comment, reply) => {
    if (post !== null)
        return post.slug;
    if (comment !== null)
        return comment.post.slug;
    if (reply !== null)
        return reply.post.slug;
    return null;
};
exports.getNotificationPostSlug = getNotificationPostSlug;
//# sourceMappingURL=utils.js.map