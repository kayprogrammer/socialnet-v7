import { Schema, model, Types, Model } from 'mongoose';
import { IBase, IFile } from './base';
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

enum REACTION_CHOICES_ENUM {
    LIKE = "LIKE",
    LOVE = "LOVE",
    HAHA = "HAHA",
    WOW = "WOW",
    SAD = "SAD",
    ANGRY = "ANGRY"
}

// Create the Post schema
const PostSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    slug: { type: String, unique: true, blank: true, index: true },
    image: { type: Schema.Types.ObjectId, ref: 'File', default: null },
    reactions: [{ 
        rType: { type: String, enum: REACTION_CHOICES_ENUM, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
}, { timestamps: true });

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

PostSchema.virtual('commentsCount', {
    ref: 'Comment', // Reference to the Comment model
    localField: '_id', 
    foreignField: 'post',
    options: {
        match: {
            parent: null,
        },
    },
    count: true,
});


// Create the Post model
const Post = model<IPost>('Post', PostSchema);

// Define the interface for the Comment model
interface IComment extends IBase {
    author: Types.ObjectId | IUser;
    post: Types.ObjectId | IPost;
    text: string;
    slug: string;
    parent: Types.ObjectId;
    replies?: IComment[];
    reactions: { rType: string; userId: Types.ObjectId }[]; // Array of reaction objects

    // Not in database
    reactionsCount: number;
    repliesCount: number;
}

// Create the Comment schema
const CommentSchema = new Schema<IComment>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    slug: { type: String, unique: true, index: true, blank: true }, // Added indexing
    reactions: [{ 
        rType: { type: String, enum: REACTION_CHOICES_ENUM, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // Self-referencing
}, { timestamps: true });

// Pre-save hook to generate a slug
CommentSchema.pre<IComment>('save', async function (next) {
    if (!this.isModified('slug') || !this.slug) {
        const author = await User.findById(this.author) as IUser;
        if (author) {
            this.slug = `${author.firstName}-${author.lastName}-${this._id}`.toLowerCase().replace(/\s+/g, '-');
        }
    }
    next();
});

// Middleware to delete replies when a comment is removed
CommentSchema.pre<IComment>('deleteOne', { document: true, query: false }, async function(next) {
    // Remove all replies associated with this comment
    await (this.model('Comment') as Model<IComment>).deleteMany({ parent: this._id });
    next();
});

CommentSchema.virtual('reactionsCount').get(function(this: IPost) {
    return this.reactions.length
});

CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parent',
});

CommentSchema.virtual('repliesCount').get(function() {
    return this.replies ? this.replies.length : 0; 
});

// Create the Comment model
const Comment = model<IComment>('Comment', CommentSchema);

export { Post, Comment, IPost, IComment, REACTION_CHOICES_ENUM };
