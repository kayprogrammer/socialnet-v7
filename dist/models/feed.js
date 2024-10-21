"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTION_CHOICES_ENUM = exports.Comment = exports.Post = void 0;
const mongoose_1 = require("mongoose");
const accounts_1 = require("./accounts");
const utils_1 = require("./utils");
var REACTION_CHOICES_ENUM;
(function (REACTION_CHOICES_ENUM) {
    REACTION_CHOICES_ENUM["LIKE"] = "LIKE";
    REACTION_CHOICES_ENUM["LOVE"] = "LOVE";
    REACTION_CHOICES_ENUM["HAHA"] = "HAHA";
    REACTION_CHOICES_ENUM["WOW"] = "WOW";
    REACTION_CHOICES_ENUM["SAD"] = "SAD";
    REACTION_CHOICES_ENUM["ANGRY"] = "ANGRY";
})(REACTION_CHOICES_ENUM || (exports.REACTION_CHOICES_ENUM = REACTION_CHOICES_ENUM = {}));
// Create the Post schema
const PostSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    slug: { type: String, unique: true, blank: true, index: true },
    image: { type: mongoose_1.Schema.Types.ObjectId, ref: 'File', default: null },
    reactions: [{
            rType: { type: String, enum: REACTION_CHOICES_ENUM, required: true },
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
        }],
}, { timestamps: true });
// Pre-save hook to generate a slug
PostSchema.pre('save', async function (next) {
    if (!this.isModified('slug') || !this.slug) {
        const author = await accounts_1.User.findById(this.author);
        if (author) {
            this.slug = `${author.firstName}-${author.lastName}-${this._id}`.toLowerCase().replace(/\s+/g, '-');
        }
    }
    next();
});
PostSchema.virtual('imageUrl').get(function () {
    return (0, utils_1.getFileUrl)(this.image, "posts");
});
PostSchema.virtual('reactionsCount').get(function () {
    return this.reactions.length;
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
}).get(function (value) {
    return value === undefined ? 0 : value;
});
// Create the Post model
const Post = (0, mongoose_1.model)('Post', PostSchema);
exports.Post = Post;
// Create the Comment schema
const CommentSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    slug: { type: String, unique: true, index: true, blank: true }, // Added indexing
    reactions: [{
            rType: { type: String, enum: REACTION_CHOICES_ENUM, required: true },
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
        }],
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Comment', default: null }, // Self-referencing
}, { timestamps: true });
// Pre-save hook to generate a slug
CommentSchema.pre('save', async function (next) {
    if (!this.isModified('slug') || !this.slug) {
        const author = await accounts_1.User.findById(this.author);
        if (author) {
            this.slug = `${author.firstName}-${author.lastName}-${this._id}`.toLowerCase().replace(/\s+/g, '-');
        }
    }
    next();
});
// Middleware to delete replies when a comment is removed
CommentSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    // Remove all replies associated with this comment
    await this.model('Comment').deleteMany({ parent: this._id });
    next();
});
CommentSchema.virtual('reactionsCount').get(function () {
    return this.reactions.length;
});
CommentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parent',
});
CommentSchema.virtual('repliesCount').get(function () {
    return this.replies ? this.replies.length : 0;
});
// Create the Comment model
const Comment = (0, mongoose_1.model)('Comment', CommentSchema);
exports.Comment = Comment;
//# sourceMappingURL=feed.js.map