"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../config/utils");
const feed_1 = require("../models/feed");
const paginator_1 = require("../config/paginator");
const feed_2 = require("../schemas/feed");
const error_1 = require("../middlewares/error");
const auth_1 = require("../middlewares/auth");
const base_1 = require("../models/base");
const file_processors_1 = __importDefault(require("../config/file_processors"));
const handlers_1 = require("../config/handlers");
const feed_3 = require("../managers/feed");
const users_1 = require("../managers/users");
const profiles_1 = require("../managers/profiles");
const profiles_2 = require("../models/profiles");
const notification_1 = require("../sockets/notification");
const base_2 = require("../sockets/base");
const feedRouter = (0, express_1.Router)();
/**
 * @route GET /posts
 * @description Get Latest Posts.
 */
feedRouter.get('/posts', async (req, res, next) => {
    try {
        let data = await (0, paginator_1.paginateModel)(req, feed_1.Post, {}, [(0, users_1.shortUserPopulation)("author"), "image", "commentsCount"]);
        let postsData = { posts: data.items, ...data };
        delete postsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Posts fetched', postsData, feed_2.PostsResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /posts
 * @description Create Post.
 */
feedRouter.post('/posts', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.PostCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const postData = req.body;
        const { text, fileType } = postData;
        let file = null;
        if (fileType)
            file = await base_1.File.create({ resourceType: fileType });
        const post = await feed_1.Post.create({ author: user.id, image: file?.id, text });
        post.author = user;
        if (file)
            post.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "posts");
        return res.status(201).json(utils_1.CustomResponse.success('Post created', post, feed_2.PostCreateResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /posts/:slug
 * @description Get Post Detail.
 */
feedRouter.get('/posts/:slug', async (req, res, next) => {
    try {
        let post = await feed_1.Post.findOne({ slug: req.params.slug }).populate([(0, users_1.shortUserPopulation)("author"), "image", "commentsCount"]);
        if (!post)
            throw new handlers_1.NotFoundError("Post does not exist");
        return res.status(200).json(utils_1.CustomResponse.success('Post details fetched', post, feed_2.PostSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /posts
 * @description Update a Post.
 */
feedRouter.put('/posts/:slug', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.PostCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        let post = await feed_1.Post.findOne({ slug: req.params.slug }).populate([(0, users_1.shortUserPopulation)("author"), "image"]);
        if (!post)
            throw new handlers_1.NotFoundError("Post does not exist");
        if (post.author.id !== user.id)
            throw new handlers_1.RequestError("Post is not yours to edit", 400, handlers_1.ErrorCode.INVALID_OWNER);
        const postData = req.body;
        const { text, fileType } = postData;
        let file = null;
        if (fileType)
            file = await base_1.File.create({ resourceType: fileType });
        post.text = text;
        if (file)
            post.image = file;
        await post.save();
        if (file)
            post.fileUploadData = file_processors_1.default.generateFileSignature(file.id.toString(), "posts");
        return res.status(200).json(utils_1.CustomResponse.success('Post updated', post, feed_2.PostCreateResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /posts/:slug
 * @description Delete a Post.
 */
feedRouter.delete('/posts/:slug', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;
        let post = await feed_1.Post.findOne({ slug: req.params.slug });
        if (!post)
            throw new handlers_1.NotFoundError("Post does not exist");
        if (post.author.toString() !== user.id)
            throw new handlers_1.RequestError("Post is not yours to delete", 400, handlers_1.ErrorCode.INVALID_OWNER);
        await post.deleteOne();
        return res.status(200).json(utils_1.CustomResponse.success('Post deleted'));
    }
    catch (error) {
        next(error);
    }
});
/** -------------------REACTIONS------------------- */
/**
 * @route GET /reactions/:slug
 * @description Get Reactions of a Post, Comment or Reply.
 */
feedRouter.get('/reactions/:slug', async (req, res, next) => {
    try {
        const reactionType = req.query.reactionType || null;
        const postOrComment = await (0, feed_3.getPostOrComment)(req.params.slug);
        if (!postOrComment)
            throw new handlers_1.NotFoundError("No Post, Comment or Reply with that slug");
        let reactions = postOrComment.reactions;
        if (reactionType)
            reactions = reactions.filter(item => item["rType"] === reactionType);
        let data = await (0, paginator_1.paginateRecords)(req, reactions);
        let reactionsData = { reactions: data.items, ...data };
        delete reactionsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Reactions fetched', reactionsData, feed_2.ReactionsResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /reactions/:slug
 * @description Create a Reaction.
 */
feedRouter.post('/reactions/:slug', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.ReactionCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const { rType } = req.body;
        const postOrComment = await (0, feed_3.getPostOrComment)(req.params.slug);
        if (!postOrComment)
            throw new handlers_1.NotFoundError("No Post, Comment or Reply with that slug");
        const reactionData = await (0, feed_3.addOrUpdateReaction)(postOrComment, user.id, rType);
        const dataToReturn = { user, rType: reactionData.rType };
        // Create and send notification in socket
        if (user.toString() != postOrComment.author.toString()) {
            const [notification, created] = await (0, profiles_1.findOrCreateNotification)(user, profiles_2.NOTIFICATION_TYPE_CHOICES.REACTION, postOrComment, postOrComment.author.toString());
            if (created)
                (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification);
        }
        return res.status(201).json(utils_1.CustomResponse.success('Reaction created', dataToReturn, feed_2.ReactionSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /reactions/:slug
 * @description Delete a Reaction.
 */
feedRouter.delete('/reactions/:slug', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;
        let postOrComment = await (0, feed_3.getPostOrComment)(req.params.slug);
        if (!postOrComment)
            throw new handlers_1.NotFoundError("No Post, Comment or Reply with that slug");
        await (0, feed_3.removeReaction)(postOrComment, user.id);
        // Delete notification
        const notificationData = (0, profiles_1.setFeedObjForNotification)({ sender: user._id, nType: profiles_2.NOTIFICATION_TYPE_CHOICES.REACTION }, postOrComment);
        const notification = await profiles_2.Notification.findOne(notificationData);
        if (notification)
            (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification, base_2.SOCKET_STATUS_CHOICES.DELETED);
        return res.status(200).json(utils_1.CustomResponse.success('Reaction deleted'));
    }
    catch (error) {
        next(error);
    }
});
/** ---------------------------------------------- */
/** -------------------COMMENTS------------------- */
/**
 * @route GET /posts/:slug/comment
 * @description Get All Comments of a Post.
 */
feedRouter.get('/posts/:slug/comments', async (req, res, next) => {
    try {
        let post = await feed_1.Post.findOne({ slug: req.params.slug });
        if (!post)
            throw new handlers_1.NotFoundError("Post does not exist");
        let data = await (0, paginator_1.paginateModel)(req, feed_1.Comment, { post: post.id, parent: null }, [(0, users_1.shortUserPopulation)("author"), "replies"]);
        let commentsData = { comments: data.items, ...data };
        delete commentsData.items;
        return res.status(200).json(utils_1.CustomResponse.success('Comments fetched', commentsData, feed_2.CommentsResponseSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /posts/:slug/comments
 * @description Create Comment.
 */
feedRouter.post('/posts/:slug/comments', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.CommentCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        let post = await feed_1.Post.findOne({ slug: req.params.slug });
        if (!post)
            throw new handlers_1.NotFoundError("Post does not exist");
        const { text } = req.body;
        const comment = await feed_1.Comment.create({ author: user.id, post: post.id, text });
        comment.author = user;
        // Create and send notification in socket
        const author = post.author;
        if (user.toString() != author.toString()) {
            let notification = await profiles_2.Notification.create({ sender: user._id, receiver: author, nType: profiles_2.NOTIFICATION_TYPE_CHOICES.COMMENT, comment: comment._id });
            notification = await notification.populate(profiles_1.notificationPopulationData);
            (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification);
        }
        return res.status(201).json(utils_1.CustomResponse.success('Comment created', comment, feed_2.CommentSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /comments/:slug
 * @description Get A Comment with replies.
 */
feedRouter.get('/comments/:slug', async (req, res, next) => {
    try {
        let comment = await feed_1.Comment.findOne({ slug: req.params.slug, parent: null }).populate([(0, users_1.shortUserPopulation)("author"), { path: "replies", populate: (0, users_1.shortUserPopulation)("author") }]);
        if (!comment)
            throw new handlers_1.NotFoundError("Comment does not exist");
        let replies = comment.replies;
        delete comment.replies;
        let data = await (0, paginator_1.paginateRecords)(req, replies);
        let commentWithRepliesData = { comment, replies: data };
        return res.status(200).json(utils_1.CustomResponse.success('Comment with replies fetched', commentWithRepliesData, feed_2.CommentWithRepliesSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /comments/:slug
 * @description Create Reply.
 */
feedRouter.post('/comments/:slug', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.CommentCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        let comment = await feed_1.Comment.findOne({ slug: req.params.slug, parent: null });
        if (!comment)
            throw new handlers_1.NotFoundError("Comment does not exist");
        const { text } = req.body;
        const reply = await feed_1.Comment.create({ author: user.id, post: comment.post, parent: comment.id, text });
        reply.author = user;
        // Create and send notification in socket
        const author = comment.author;
        if (user.toString() != author.toString()) {
            let notification = await profiles_2.Notification.create({ sender: user._id, receiver: author, nType: profiles_2.NOTIFICATION_TYPE_CHOICES.REPLY, reply: reply._id });
            notification = await notification.populate(profiles_1.notificationPopulationData);
            (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification);
        }
        return res.status(201).json(utils_1.CustomResponse.success('Reply created', reply, feed_2.ReplySchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /comments/:slug
 * @description Update Comment.
 */
feedRouter.put('/comments/:slug', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.CommentCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        let comment = await feed_1.Comment.findOne({ slug: req.params.slug, parent: null }).populate([(0, users_1.shortUserPopulation)("author"), "replies"]);
        if (!comment)
            throw new handlers_1.NotFoundError("Comment does not exist");
        if (comment.author.id !== user.id)
            throw new handlers_1.RequestError("Comment is not yours to edit", 400, handlers_1.ErrorCode.INVALID_OWNER);
        const { text } = req.body;
        comment.text = text;
        await comment.save();
        return res.status(200).json(utils_1.CustomResponse.success('Comment updated', comment, feed_2.CommentSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /comments/:slug
 * @description Delete Comment.
 */
feedRouter.delete('/comments/:slug', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;
        let comment = await feed_1.Comment.findOne({ slug: req.params.slug, parent: null });
        if (!comment)
            throw new handlers_1.NotFoundError("Comment does not exist");
        if (comment.author.toString() !== user.id)
            throw new handlers_1.RequestError("Comment is not yours to delete", 400, handlers_1.ErrorCode.INVALID_OWNER);
        // Delete notification and send in socket
        const notification = await profiles_2.Notification.findOne({ sender: user._id, nType: profiles_2.NOTIFICATION_TYPE_CHOICES.COMMENT, comment: comment._id });
        if (notification)
            (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification, base_2.SOCKET_STATUS_CHOICES.DELETED);
        await comment.deleteOne();
        return res.status(200).json(utils_1.CustomResponse.success('Comment deleted'));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /replies/:slug
 * @description Get Reply.
 */
feedRouter.get('/replies/:slug', async (req, res, next) => {
    try {
        const reply = await feed_1.Comment.findOne({ slug: req.params.slug, parent: { $ne: null } }).populate((0, users_1.shortUserPopulation)("author"));
        if (!reply)
            throw new handlers_1.NotFoundError("Reply does not exist");
        return res.status(200).json(utils_1.CustomResponse.success('Reply fetched', reply, feed_2.ReplySchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /replies/:slug
 * @description Update Reply.
 */
feedRouter.put('/replies/:slug', auth_1.authMiddleware, (0, error_1.validationMiddleware)(feed_2.CommentCreateSchema), async (req, res, next) => {
    try {
        const user = req.user;
        const reply = await feed_1.Comment.findOne({ slug: req.params.slug, parent: { $ne: null } }).populate((0, users_1.shortUserPopulation)("author"));
        if (!reply)
            throw new handlers_1.NotFoundError("Reply does not exist");
        if (reply.author.id !== user.id)
            throw new handlers_1.RequestError("Reply is not yours to edit", 400, handlers_1.ErrorCode.INVALID_OWNER);
        const { text } = req.body;
        reply.text = text;
        await reply.save();
        return res.status(200).json(utils_1.CustomResponse.success('Reply updated', reply, feed_2.ReplySchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route DELETE /replies/:slug
 * @description Delete Reply.
 */
feedRouter.delete('/replies/:slug', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;
        let reply = await feed_1.Comment.findOne({ slug: req.params.slug, parent: { $ne: null } });
        if (!reply)
            throw new handlers_1.NotFoundError("Reply does not exist");
        if (reply.author.toString() !== user.id)
            throw new handlers_1.RequestError("Reply is not yours to delete", 400, handlers_1.ErrorCode.INVALID_OWNER);
        // Delete notification and send in socket
        const notification = await profiles_2.Notification.findOne({ sender: user._id, nType: profiles_2.NOTIFICATION_TYPE_CHOICES.REPLY, reply: reply._id });
        if (notification)
            (0, notification_1.sendNotificationInSocket)(req.secure, req.get("host"), notification, base_2.SOCKET_STATUS_CHOICES.DELETED);
        await reply.deleteOne();
        return res.status(200).json(utils_1.CustomResponse.success('Reply deleted'));
    }
    catch (error) {
        next(error);
    }
});
/** ---------------------------------------------- */
exports.default = feedRouter;
//# sourceMappingURL=feed.js.map