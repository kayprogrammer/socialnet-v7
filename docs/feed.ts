import { ErrorCode } from "../config/handlers";
import { CommentCreateSchema, CommentSchema, CommentsResponseSchema, CommentWithRepliesSchema, PostCreateResponseSchema, PostCreateSchema, PostSchema, PostsResponseSchema, ReactionCreateSchema, ReactionSchema, ReactionsResponseSchema, ReplySchema } from "../schemas/feed";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

const tags = ["Feed (17)"]
const postsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest posts',
        description: `Fetch all the latest posts`,
        parameters: [
            generateParamExample("page", "Current page of posts to fetch", "integer", 1),
            generateParamExample("limit", "Number of posts per page to fetch", "integer", 100),
        ],
        responses: {
            200: generateSwaggerResponseExample('Posts fetched successful response', SUCCESS_STATUS, "Posts fetched", PostsResponseSchema),
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a post',
        description: `Allows authenticated users to create a post`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Post", PostCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Post created response', SUCCESS_STATUS, "Post created", PostCreateResponseSchema),
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
};

const SLUG_EXAMPLE = "john-doe-507f1f77bcf86cd799439011"
const SLUG_PARAM = generateParamExample("slug", "Slug of the post to fetch", "string", SLUG_EXAMPLE, "path")
const POST_NOT_FOUND_RESPONSE = generateSwaggerResponseExample("Post Not Found response", FAILURE_STATUS, "Post Does not exist", null, ErrorCode.NON_EXISTENT)

const postDetailDocs = {
    get: {
        tags: tags,
        summary: 'Get post details',
        description: `Fetch details of a single post.`,
        parameters: [SLUG_PARAM],
        responses: {
            200: generateSwaggerResponseExample('Post detail fetched successful response', SUCCESS_STATUS, "Post details fetched", PostSchema),
            404: POST_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update a post',
        description: `Allows authenticated users to update a post`,
        security: [{ BearerAuth: [] }],
        parameters: [SLUG_PARAM],
        requestBody: generateSwaggerRequestExample("Post", PostCreateSchema),
        responses: {
            200: generateSwaggerResponseExample('Post updated response', SUCCESS_STATUS, "Post updated", PostCreateResponseSchema),
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_NOT_FOUND_RESPONSE,
            400: generateSwaggerResponseExample("Post Not Yours response", FAILURE_STATUS, "Post is not yours to edit", null, ErrorCode.INVALID_OWNER),
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete post',
        description: `Allow auth users to delete a single post.`,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Post deleted successful response', SUCCESS_STATUS, "Post deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_NOT_FOUND_RESPONSE,
            400: generateSwaggerResponseExample("Post Not Yours response", FAILURE_STATUS, "Post is not yours to delete", null, ErrorCode.INVALID_OWNER),
            500: ERROR_EXAMPLE_500
        }
    },
};

const POST_SLUG_FOR_REACTION_PARAM = generateParamExample("slug", "Slug of the post, comment or reply to fetch", "string", SLUG_EXAMPLE, "path")
const POST_COMMENT_NOT_FOUND_RESP = generateSwaggerResponseExample("Post/Comment/Reply Not Found response", FAILURE_STATUS, "No Post, Comment or Reply with that slug", null, ErrorCode.NON_EXISTENT)
const reactionsDocs = {
    get: {
        tags: tags,
        summary: 'Get reactions',
        description: `Fetch Reactions of a Post, Comment or Reply.`,
        parameters: [
            POST_SLUG_FOR_REACTION_PARAM,
            generateParamExample("reactionType", "Filter by reaction type", "string", "LIKE"),
        ],
        responses: {
            200: generateSwaggerResponseExample('Reactions fetched successful response', SUCCESS_STATUS, "Reactions fetched", ReactionsResponseSchema),
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a reaction',
        description: `
            Allows authenticated users to create a reaction for a post, comment or reply
            rtype should be any of these:
            
            - LIKE    - LOVE
            - HAHA    - WOW
            - SAD     - ANGRY
        `,
        security: [{ BearerAuth: [] }],
        parameters: [POST_SLUG_FOR_REACTION_PARAM],
        requestBody: generateSwaggerRequestExample("Reaction", ReactionCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Reaction created response', SUCCESS_STATUS, "Reaction created", ReactionSchema),
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Remove a reaction',
        description: `Allows authenticated users to remove a reaction for a post, comment or reply`,
        security: [{ BearerAuth: [] }],
        parameters: [POST_SLUG_FOR_REACTION_PARAM],
        responses: {
            200: generateSwaggerResponseExample('Reaction deleted response', SUCCESS_STATUS, "Reaction deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: ERROR_EXAMPLE_500
        }
    },
}

const commentsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest comments of a post',
        description: `Fetches paginated comments of a post`,
        parameters: [
            SLUG_PARAM,
            generateParamExample("page", "Current page of comments to fetch", "integer", 1),
            generateParamExample("limit", "Number of comments per page to fetch", "integer", 100),
        ],
        responses: {
            200: generateSwaggerResponseExample('Comments fetched successful response', SUCCESS_STATUS, "Comments fetched", CommentsResponseSchema),
            404: POST_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a comment',
        description: `Allows authenticated users to create a comment`,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Comment", CommentCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Comment created response', SUCCESS_STATUS, "Comment created", CommentSchema),
            404: POST_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
}

const COMMENT_SLUG_PARAM = generateParamExample("slug", "Slug of the comment to fetch", "string", SLUG_EXAMPLE, "path")
const COMMENT_NOT_FOUND_RESPONSE = generateSwaggerResponseExample("Comment Not Found response", FAILURE_STATUS, "Comment Does not exist", null, ErrorCode.NON_EXISTENT)

const commentsWithRepliesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch comment with replies',
        description: `Fetches a comment with its paginated replies`,
        parameters: [
            COMMENT_SLUG_PARAM,
            generateParamExample("page", "Current page of replies to fetch", "integer", 1),
            generateParamExample("limit", "Number of replies per page to fetch", "integer", 100),
        ],
        responses: {
            200: generateSwaggerResponseExample('Replies fetched successful response', SUCCESS_STATUS, "Replies fetched", CommentWithRepliesSchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a reply',
        description: `Allows authenticated users to create a reply`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Reply", CommentCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Reply created response', SUCCESS_STATUS, "Reply created", ReplySchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update comment',
        description: `Allows authenticated users to update their comment`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Comment", CommentCreateSchema),
        responses: {
            200: generateSwaggerResponseExample('Comment updated response', SUCCESS_STATUS, "Comment updated", CommentSchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            400: generateSwaggerResponseExample("Comment Not Yours response", FAILURE_STATUS, "Comment is not yours to edit", null, ErrorCode.INVALID_OWNER),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete comment',
        description: `Allows authenticated users to delete their comment`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Comment deleted response', SUCCESS_STATUS, "Comment deleted"),
            404: COMMENT_NOT_FOUND_RESPONSE,
            400: generateSwaggerResponseExample("Comment Not Yours response", FAILURE_STATUS, "Comment is not yours to delete", null, ErrorCode.INVALID_OWNER),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
}

const REPLY_SLUG_PARAM = generateParamExample("slug", "Slug of the reply to fetch", "string", SLUG_EXAMPLE, "path")
const REPLY_NOT_FOUND_RESPONSE = generateSwaggerResponseExample("Reply Not Found response", FAILURE_STATUS, "Reply Does not exist", null, ErrorCode.NON_EXISTENT)

const replyDocs = {
    get: {
        tags: tags,
        summary: 'Get single reply',
        description: `Get a single reply`,
        parameters: [REPLY_SLUG_PARAM],
        responses: {
            200: generateSwaggerResponseExample('Reply fetched successful response', SUCCESS_STATUS, "Reply fetched", ReplySchema),
            404: REPLY_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update a reply',
        description: `Allows authenticated users to update a reply`,
        parameters: [REPLY_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Reply", CommentCreateSchema),
        responses: {
            200: generateSwaggerResponseExample('Reply updated response', SUCCESS_STATUS, "Reply updated", ReplySchema),
            404: REPLY_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            400: generateSwaggerResponseExample("Reply Not Yours response", FAILURE_STATUS, "Reply is not yours to update", null, ErrorCode.INVALID_OWNER),
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete a reply',
        description: `Allows authenticated users to delete their reply`,
        parameters: [REPLY_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Reply deleted response', SUCCESS_STATUS, "Reply deleted"),
            404: REPLY_NOT_FOUND_RESPONSE,
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            400: generateSwaggerResponseExample("Reply Not Yours response", FAILURE_STATUS, "Reply is not yours to delete", null, ErrorCode.INVALID_OWNER),
            500: ERROR_EXAMPLE_500
        }
    }
}

export { postsDocs, postDetailDocs, reactionsDocs, commentsDocs, commentsWithRepliesDocs, replyDocs }