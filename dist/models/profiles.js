"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TYPE_CHOICES = exports.Notification = exports.FRIEND_REQUEST_STATUS_CHOICES = exports.Friend = void 0;
const mongoose_1 = require("mongoose");
const handlers_1 = require("../config/handlers");
const utils_1 = require("./utils");
var FRIEND_REQUEST_STATUS_CHOICES;
(function (FRIEND_REQUEST_STATUS_CHOICES) {
    FRIEND_REQUEST_STATUS_CHOICES["PENDING"] = "PENDING";
    FRIEND_REQUEST_STATUS_CHOICES["ACCEPTED"] = "ACCEPTED";
})(FRIEND_REQUEST_STATUS_CHOICES || (exports.FRIEND_REQUEST_STATUS_CHOICES = FRIEND_REQUEST_STATUS_CHOICES = {}));
// Create the Friend Schema
const FriendSchema = new mongoose_1.Schema({
    requester: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    requestee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: FRIEND_REQUEST_STATUS_CHOICES, default: FRIEND_REQUEST_STATUS_CHOICES.PENDING, required: true, maxlength: 50 },
}, { timestamps: true });
FriendSchema.pre('save', async function (next) {
    let requester = this.requester;
    let requestee = this.requestee;
    // Ensure requester and requestee are not the same person
    if (requester.equals(requestee)) {
        return next(new handlers_1.RequestError('You cannot send a friend request to yourself', 403, handlers_1.ErrorCode.NOT_ALLOWED));
    }
    // Explicitly cast `this.constructor` to the Mongoose model type
    const FriendModel = this.constructor;
    // Check if a reverse record already exists (bidirectional uniqueness)
    const existingFriend = await FriendModel.findOne({
        $or: [
            { requester: requester, requestee: requestee },
            { requester: requestee, requestee: requester }
        ]
    });
    if (existingFriend && this.isNew) {
        return next(new handlers_1.RequestError('Friendship already exists', 409, handlers_1.ErrorCode.NOT_ALLOWED));
    }
    next();
});
FriendSchema.index({ requester: 1, requestee: 1 }, { unique: true });
FriendSchema.index({ requestee: 1, requester: 1 }, { unique: true });
// Create the Friend model
const Friend = (0, mongoose_1.model)('Friend', FriendSchema);
exports.Friend = Friend;
var NOTIFICATION_TYPE_CHOICES;
(function (NOTIFICATION_TYPE_CHOICES) {
    NOTIFICATION_TYPE_CHOICES["REACTION"] = "REACTION";
    NOTIFICATION_TYPE_CHOICES["COMMENT"] = "COMMENT";
    NOTIFICATION_TYPE_CHOICES["REPLY"] = "REPLY";
    NOTIFICATION_TYPE_CHOICES["ADMIN"] = "ADMIN";
})(NOTIFICATION_TYPE_CHOICES || (exports.NOTIFICATION_TYPE_CHOICES = NOTIFICATION_TYPE_CHOICES = {}));
// Create the Notification Schema
const NotificationSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    nType: { type: String, enum: NOTIFICATION_TYPE_CHOICES, required: true, maxlength: 50 },
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: false, default: null },
    comment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Comment', required: false, default: null },
    reply: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Comment', required: false, default: null },
    text: { type: String, required: false, default: null, maxlength: 500 }, // For Admin notifications only
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }] // Users who have read the notification
}, { timestamps: true });
NotificationSchema.virtual('message').get(function () {
    const text = this.text;
    if (!text)
        return (0, utils_1.getNotificationMessage)(this);
    return text;
});
NotificationSchema.virtual('postSlug').get(function () {
    return (0, utils_1.getNotificationPostSlug)(this.post, this.comment, this.reply);
});
NotificationSchema.virtual('commentSlug').get(function () {
    const reply = this.reply;
    return this.comment?.slug || reply?.parent?.slug || null;
});
NotificationSchema.virtual('replySlug').get(function () {
    return this.reply?.slug || null;
});
// Create the Notification model
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.Notification = Notification;
//# sourceMappingURL=profiles.js.map