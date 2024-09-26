import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../config/utils";
import { Post } from "../models/feed";
import paginate from "../config/paginator";
import { PostCreateResponseSchema, PostCreateSchema, PostSchema, PostsResponseSchema } from "../schemas/feed";
import { validationMiddleware } from "../middlewares/error";
import { authMiddleware } from "../middlewares/auth";
import { File } from "../models/base";
import FileProcessor from "../config/file_processors";
import { NotFoundError } from "../config/handlers";

const feedRouter = Router();

/**
 * @route GET /posts
 * @description Get Latest Posts.
 */
feedRouter.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let data = await paginate(req, Post, {}, [{path: 'author', select: "firstName lastName username avatar", populate: {path: 'avatar'}}, "image"])
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

export default feedRouter;