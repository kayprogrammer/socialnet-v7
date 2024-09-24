import mongoose, { Schema, model, Types } from 'mongoose';
import { IBase, BaseSchema, IFile } from './base';
import { IUser, User } from './accounts';
import { getFileUrl } from './utils';

// Define the interface for the Post model
interface IPost extends IBase {
    author: Types.ObjectId | IUser;
    text: string;
    slug: string;
    image?: Types.ObjectId | IFile;
    reactions: { rType: string; userId: Types.ObjectId }[]; // Array of reaction objects

    // Not in database
    imageUrl: string | null;
    reactionsCount: number;
    commentsCount: number;
    fileUploadData?: { publicId: string, signature: string, timestamp: string } | null;
}

const REACTION_CHOICES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', "ANGRY"];

// Create the Post schema
const PostSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    slug: { type: String, unique: true, blank: true }, // For slug, you can generate it before saving
    image: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    reactions: [{ 
        rType: { type: String, enum: REACTION_CHOICES, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
});

// Merge BaseSchema
PostSchema.add(BaseSchema.obj);

// Pre-save hook to generate a slug
PostSchema.pre<IPost>('save', async function (next) {
    if (!this.isModified('slug') || !this.slug) {
        const author = await User.findById(this.author) as IUser;
        if (author) {
            this.slug = `${author.firstName}-${author.lastName}-${this._id}`.toLowerCase().replace(/\s+/g, '-');
        }
    }
    next();
});

PostSchema.virtual('imageUrl').get(function(this: IPost) {
    return getFileUrl(this.image, "posts")
});

PostSchema.virtual('reactionsCount').get(function(this: IPost) {
    return this.reactions.length
});

PostSchema.virtual('commentsCount').get(function(this: IPost) {
    return 0
});


// Create the Post model
const Post = model<IPost>('Post', PostSchema);

// Define the interface for the Comment model
interface IComment extends IBase {
    authorId: Types.ObjectId;
    postId: Types.ObjectId;
    text: string;
    slug: string;
    replies: Types.ObjectId[];
    reactions: { rType: string; userId: Types.ObjectId }[]; // Array of reaction objects
}

// Create the Comment schema
const CommentSchema = new Schema<IComment>({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    slug: { type: String, required: true, maxlength: 1000, unique: true, index: true }, // Added indexing
    reactions: [{ 
        rType: { type: String, enum: REACTION_CHOICES, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // Self-referencing
});

// Merge BaseSchema
CommentSchema.add(BaseSchema.obj);

// Pre-save hook to generate a slug
CommentSchema.pre<IComment>('save', async function (next) {
    if (!this.isModified('slug') || !this.slug) {
        const author = await User.findById(this.authorId) as IUser;
        if (author) {
            this.slug = `${author.firstName}-${author.lastName}-${this._id}`.toLowerCase().replace(/\s+/g, '-');
        }
    }
    next();
});

// Create the Comment model
const Comment = model<IComment>('Comment', CommentSchema);

export { Post, Comment, IPost, IComment };
