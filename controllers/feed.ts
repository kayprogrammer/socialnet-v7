import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../config/utils";
import { Comment, IComment, Post } from "../models/feed";
import { paginateModel, paginateRecords } from "../config/paginator";
import { CommentCreateSchema, CommentSchema, CommentsResponseSchema, CommentWithRepliesSchema, PostCreateResponseSchema, PostCreateSchema, PostSchema, PostsResponseSchema, ReactionCreateSchema, ReactionSchema, ReactionsResponseSchema, ReplySchema } from "../schemas/feed";
import { validationMiddleware } from "../middlewares/error";
import { authMiddleware } from "../middlewares/auth";
import { File } from "../models/base";
import FileProcessor from "../config/file_processors";
import { ErrorCode, NotFoundError, RequestError } from "../config/handlers";
import { addOrUpdateReaction, getPostOrComment, removeReaction } from "../managers/feed";

const feedRouter = Router();

/**
 * @route GET /posts
 * @description Get Latest Posts.
 */
feedRouter.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let data = await paginateModel(req, Post, {}, [{path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}, "image", "commentsCount"])
        let postsData = { posts: data.items, ...data }
        delete postsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Posts fetched', 
                postsData, 
                PostsResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /posts
 * @description Create Post.
 */
feedRouter.post('/posts', authMiddleware, validationMiddleware(PostCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const postData: PostCreateSchema = req.body;
        const { text, fileType } = postData;
        let file = null
        if (fileType) file = await File.create({ resourceType: fileType })
        const post = await Post.create({ author: user.id, image: file?.id, text })
        post.author = user
        if (file) post.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "posts")
        return res.status(201).json(
            CustomResponse.success(
                'Post created', 
                post, 
                PostCreateResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /posts/:slug
 * @description Get Post Detail.
 */
feedRouter.get('/posts/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let post = await Post.findOne({ slug: req.params.slug }).populate([{path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}, "image"])
        if (!post) throw new NotFoundError("Post does not exist")
        return res.status(200).json(
            CustomResponse.success(
                'Post details fetched', 
                post, 
                PostSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route PUT /posts
 * @description Update a Post.
 */
feedRouter.put('/posts/:slug', authMiddleware, validationMiddleware(PostCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let post = await Post.findOne({ slug: req.params.slug }).populate([{path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}, "image"])
        if (!post) throw new NotFoundError("Post does not exist")
        if (post.author.id !== user.id) throw new RequestError("Post is not yours to edit", 400, ErrorCode.INVALID_OWNER)
        const postData: PostCreateSchema = req.body;
        const { text, fileType } = postData;
        let file = null
        if (fileType) file = await File.create({ resourceType: fileType })
        post.text = text as string
        if (file) post.image = file
        await post.save()
        if (file) post.fileUploadData = FileProcessor.generateFileSignature(file.id.toString(), "posts")
        return res.status(200).json(
            CustomResponse.success(
                'Post updated', 
                post, 
                PostCreateResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /posts/:slug
 * @description Delete a Post.
 */
feedRouter.delete('/posts/:slug', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let post = await Post.findOne({ slug: req.params.slug })
        if (!post) throw new NotFoundError("Post does not exist")
        if (post.author.toString() !== user.id) throw new RequestError("Post is not yours to delete", 400, ErrorCode.INVALID_OWNER)
        await post.deleteOne()
        return res.status(200).json(CustomResponse.success('Post deleted'))
    } catch (error) {
        next(error)
    }
});

/** -------------------REACTIONS------------------- */
/**
 * @route GET /reactions/:slug
 * @description Get Reactions of a Post, Comment or Reply.
 */
feedRouter.get('/reactions/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reactionType = req.query.reactionType || null
        const postOrComment = await getPostOrComment(req.params.slug)
        if (!postOrComment) throw new NotFoundError("No Post, Comment or Reply with that slug")
        let reactions = postOrComment.reactions
        if (reactionType) reactions = reactions.filter(item => item["rType"] === reactionType)
        let data = await paginateRecords(req, reactions)
        let reactionsData = { reactions: data.items, ...data }
        delete reactionsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Reactions fetched', 
                reactionsData, 
                ReactionsResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /reactions/:slug
 * @description Create a Reaction.
 */
feedRouter.post('/reactions/:slug', authMiddleware, validationMiddleware(ReactionCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { rType } = req.body;
        let postOrComment = await getPostOrComment(req.params.slug)
        if (!postOrComment) throw new NotFoundError("No Post, Comment or Reply with that slug")
        let reactionData = await addOrUpdateReaction(postOrComment, user.id, rType)
        let dataToReturn = { user, rType: reactionData.rType }
        return res.status(201).json(
            CustomResponse.success(
                'Reaction created', 
                dataToReturn, 
                ReactionSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /reactions/:slug
 * @description Delete a Reaction.
 */
feedRouter.delete('/reactions/:slug', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let postOrComment = await getPostOrComment(req.params.slug)
        if (!postOrComment) throw new NotFoundError("No Post, Comment or Reply with that slug")
        await removeReaction(postOrComment, user.id)
        return res.status(200).json(CustomResponse.success('Reaction deleted'))
    } catch (error) {
        next(error)
    }
});
/** ---------------------------------------------- */

/** -------------------COMMENTS------------------- */
/**
 * @route GET /posts/:slug/comment
 * @description Get All Comments of a Post.
 */
feedRouter.get('/posts/:slug/comments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let post = await Post.findOne({ slug: req.params.slug })
        if (!post) throw new NotFoundError("Post does not exist")
        let data = await paginateModel(req, Comment, {post: post.id, parent: null}, [{path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}, "replies"])
        let commentsData = { comments: data.items, ...data }
        delete commentsData.items
        return res.status(200).json(
            CustomResponse.success(
                'Comments fetched', 
                commentsData, 
                CommentsResponseSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /posts/:slug/comments
 * @description Create Comment.
 */
feedRouter.post('/posts/:slug/comments', authMiddleware, validationMiddleware(CommentCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let post = await Post.findOne({ slug: req.params.slug })
        if (!post) throw new NotFoundError("Post does not exist")
        const { text } = req.body;
        const comment = await Comment.create({ author: user.id, post: post.id, text })
        comment.author = user
        return res.status(201).json(
            CustomResponse.success(
                'Comment created', 
                comment, 
                CommentSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /comments/:slug
 * @description Get A Comment with replies.
 */
feedRouter.get('/comments/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorPopulation = {path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}
        let comment = await Comment.findOne({ slug: req.params.slug, parent: null }).populate(
            [authorPopulation, {path: "replies", populate: authorPopulation}]
        )
        if (!comment) throw new NotFoundError("Comment does not exist")
        let replies = comment.replies
        delete comment.replies
        let data = await paginateRecords(req, replies as IComment[])
        let commentWithRepliesData = { comment, replies: data }
        return res.status(200).json(
            CustomResponse.success(
                'Comment with replies fetched', 
                commentWithRepliesData, 
                CommentWithRepliesSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /comments/:slug
 * @description Create Reply.
 */
feedRouter.post('/comments/:slug', authMiddleware, validationMiddleware(CommentCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let comment = await Comment.findOne({ slug: req.params.slug, parent: null })
        if (!comment) throw new NotFoundError("Comment does not exist")
        const { text } = req.body;
        const reply = await Comment.create({ author: user.id, post: comment.post, parent: comment.id, text })
        reply.author = user
        return res.status(201).json(
            CustomResponse.success(
                'Reply created', 
                reply, 
                ReplySchema
            )    
        )
    } catch (error) {
        next(error)
    }
});
/** ---------------------------------------------- */


export default feedRouter;