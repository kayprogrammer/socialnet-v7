import { model, Schema, Types } from "mongoose";
import { IUser } from "./accounts";
import { IBase } from "./base";

interface IFriend extends IBase {
    requester: IUser | Types.ObjectId;
    requestee: IUser | Types.ObjectId;
    status: string;
}
enum REQUEST_STATUS_CHOICES {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
}
// Create the Friend Schema
const FriendSchema = new Schema<IFriend>({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: REQUEST_STATUS_CHOICES, required: true, maxlength: 50 },
}, {timestamps: true})

// Custom validation to ensure requester and requestee are not the same
FriendSchema.pre('save', function (next) {
    let requester = this.requester as Types.ObjectId
    let requestee = this.requestee as Types.ObjectId
    if (requester.equals(requestee)) {
      return next(new Error('Requester and Requestee cannot be the same user'));
    }
    next();
});

// Create a unique index to enforce bidirectional uniqueness
FriendSchema.index(
    {
      requester: 1,
      requestee: 1,
    },
    {
      unique: true,
      partialFilterExpression: {
        requester: { $exists: true },
        requestee: { $exists: true },
      },
      collation: { locale: 'en', strength: 2 }, // To make comparison case-insensitive
    }
);

// Create the Friend model
const Friend = model<IFriend>('Friend', FriendSchema);

export { Friend, IFriend, REQUEST_STATUS_CHOICES }