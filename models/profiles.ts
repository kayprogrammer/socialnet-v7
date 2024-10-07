import mongoose, { model, Schema, Types } from "mongoose";
import { IUser } from "./accounts";
import { IBase } from "./base";
import { ErrorCode, RequestError } from "../config/handlers";
import { IComment, IPost } from "./feed";
import { getNotificationMessage } from "./utils";

enum FRIEND_REQUEST_STATUS_CHOICES {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

interface IFriend extends IBase {
  requester: IUser | Types.ObjectId;
  requestee: IUser | Types.ObjectId;
  status: FRIEND_REQUEST_STATUS_CHOICES;
}

// Create the Friend Schema
const FriendSchema = new Schema<IFriend>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: FRIEND_REQUEST_STATUS_CHOICES, default: FRIEND_REQUEST_STATUS_CHOICES.PENDING, required: true, maxlength: 50 },
}, {timestamps: true})

FriendSchema.pre('save', async function (next) {
  let requester = this.requester as Types.ObjectId;
  let requestee = this.requestee as Types.ObjectId;

  // Ensure requester and requestee are not the same person
  if (requester.equals(requestee)) {
    return next(new RequestError('You cannot send a friend request to yourself', 403, ErrorCode.NOT_ALLOWED));
  }

  // Explicitly cast `this.constructor` to the Mongoose model type
  const FriendModel = this.constructor as mongoose.Model<typeof this>;

  // Check if a reverse record already exists (bidirectional uniqueness)
  const existingFriend = await FriendModel.findOne({
    requester: requestee,
    requestee: requester
  });

  if (existingFriend) {
    return next(new RequestError('Friendship already exists', 409, ErrorCode.NOT_ALLOWED));
  }

  // Sort the requester and requestee so that (requester, requestee) and (requestee, requester) are treated the same
  if (requester.toString() > requestee.toString()) {
    // Swap requester and requestee if requester > requestee
    this.requester = requestee;
    this.requestee = requester;
  }

  next();
});


// Create the Friend model
const Friend = model<IFriend>('Friend', FriendSchema);

enum NOTIFICATION_TYPE_CHOICES {
  REACTION = "REACTION",
  COMMENT = "COMMENT",
  REPLY = "REPLY",
  ADMIN = "ADMIN"
}
interface INotification extends IBase {
  sender: IUser | Types.ObjectId;
  receiver: IUser | Types.ObjectId;
  nType: NOTIFICATION_TYPE_CHOICES;
  post: IPost | Types.ObjectId;
  comment: IComment | Types.ObjectId;
  reply: IComment | Types.ObjectId;
  text: string | null
  message: string;
  readBy: IUser[] | Types.ObjectId[];
}

// Create the Notification Schema
const NotificationSchema = new Schema<INotification>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  nType: { type: String, enum: NOTIFICATION_TYPE_CHOICES, required: true, maxlength: 50 },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: false, default: null },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: false, default: null },
  reply: { type: Schema.Types.ObjectId, ref: 'Comment', required: false, default: null },
  text: { type: String, required: false, default: null, maxlength: 500 }, // For Admin notifications only
  readBy: [{type: Schema.Types.ObjectId, ref: 'User', required: true }] // Users who have read the notification
}, {timestamps: true})

NotificationSchema.virtual('message').get(function(this: INotification) {
  return getNotificationMessage(this)
});

// Create the Notification model
const Notification = model<INotification>('Notification', NotificationSchema);

export { Friend, IFriend, FRIEND_REQUEST_STATUS_CHOICES, Notification, INotification, NOTIFICATION_TYPE_CHOICES }