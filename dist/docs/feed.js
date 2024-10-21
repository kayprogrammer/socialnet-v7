"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyDocs = exports.commentsWithRepliesDocs = exports.commentsDocs = exports.reactionsDocs = exports.postDetailDocs = exports.postsDocs = void 0;
const handlers_1 = require("../config/handlers");
const feed_1 = require("../schemas/feed");
const base_1 = require("./base");
const utils_1 = require("./utils");
const tags = ["Feed (17)"];
const postsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest posts',
        description: `Fetch all the latest posts`,
        parameters: (0, utils_1.generatePaginationParamExample)("posts"),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Posts fetched successful response', base_1.SUCCESS_STATUS, "Posts fetched", feed_1.PostsResponseSchema),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a post',
        description: `Allows authenticated users to create a post`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Post", feed_1.PostCreateSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Post created response', base_1.SUCCESS_STATUS, "Post created", feed_1.PostCreateResponseSchema),
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.postsDocs = postsDocs;
const SLUG_EXAMPLE = "john-doe-507f1f77bcf86cd799439011";
const SLUG_PARAM = (0, utils_1.generateParamExample)("slug", "Slug of the post to fetch", "string", SLUG_EXAMPLE, "path");
const POST_NOT_FOUND_RESPONSE = (0, utils_1.generateSwaggerResponseExample)("Post Not Found response", base_1.FAILURE_STATUS, "Post Does not exist", null, handlers_1.ErrorCode.NON_EXISTENT);
const postDetailDocs = {
    get: {
        tags: tags,
        summary: 'Get post details',
        description: `Fetch details of a single post.`,
        parameters: [SLUG_PARAM],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Post detail fetched successful response', base_1.SUCCESS_STATUS, "Post details fetched", feed_1.PostSchema),
            404: POST_NOT_FOUND_RESPONSE,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update a post',
        description: `Allows authenticated users to update a post`,
        security: [{ BearerAuth: [] }],
        parameters: [SLUG_PARAM],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Post", feed_1.PostCreateSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Post updated response', base_1.SUCCESS_STATUS, "Post updated", feed_1.PostCreateResponseSchema),
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_NOT_FOUND_RESPONSE,
            400: (0, utils_1.generateSwaggerResponseExample)("Post Not Yours response", base_1.FAILURE_STATUS, "Post is not yours to edit", null, handlers_1.ErrorCode.INVALID_OWNER),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete post',
        description: `Allow auth users to delete a single post.`,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Post deleted successful response', base_1.SUCCESS_STATUS, "Post deleted"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_NOT_FOUND_RESPONSE,
            400: (0, utils_1.generateSwaggerResponseExample)("Post Not Yours response", base_1.FAILURE_STATUS, "Post is not yours to delete", null, handlers_1.ErrorCode.INVALID_OWNER),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.postDetailDocs = postDetailDocs;
const POST_SLUG_FOR_REACTION_PARAM = (0, utils_1.generateParamExample)("slug", "Slug of the post, comment or reply to fetch", "string", SLUG_EXAMPLE, "path");
const POST_COMMENT_NOT_FOUND_RESP = (0, utils_1.generateSwaggerResponseExample)("Post/Comment/Reply Not Found response", base_1.FAILURE_STATUS, "No Post, Comment or Reply with that slug", null, handlers_1.ErrorCode.NON_EXISTENT);
const reactionsDocs = {
    get: {
        tags: tags,
        summary: 'Get reactions',
        description: `Fetch Reactions of a Post, Comment or Reply.`,
        parameters: [
            POST_SLUG_FOR_REACTION_PARAM,
            (0, utils_1.generateParamExample)("reactionType", "Filter by reaction type", "string", "LIKE"),
            ...(0, utils_1.generatePaginationParamExample)("reactions")
        ],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Reactions fetched successful response', base_1.SUCCESS_STATUS, "Reactions fetched", feed_1.ReactionsResponseSchema),
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: base_1.ERROR_EXAMPLE_500
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
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Reaction", feed_1.ReactionCreateSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Reaction created response', base_1.SUCCESS_STATUS, "Reaction created", feed_1.ReactionSchema),
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Remove a reaction',
        description: `Allows authenticated users to remove a reaction for a post, comment or reply`,
        security: [{ BearerAuth: [] }],
        parameters: [POST_SLUG_FOR_REACTION_PARAM],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Reaction deleted response', base_1.SUCCESS_STATUS, "Reaction deleted"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: POST_COMMENT_NOT_FOUND_RESP,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.reactionsDocs = reactionsDocs;
const commentsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest comments of a post',
        description: `Fetches paginated comments of a post`,
        parameters: [
            SLUG_PARAM,
            ...(0, utils_1.generatePaginationParamExample)("comments")
        ],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Comments fetched successful response', base_1.SUCCESS_STATUS, "Comments fetched", feed_1.CommentsResponseSchema),
            404: POST_NOT_FOUND_RESPONSE,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a comment',
        description: `Allows authenticated users to create a comment`,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Comment", feed_1.CommentCreateSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Comment created response', base_1.SUCCESS_STATUS, "Comment created", feed_1.CommentSchema),
            404: POST_NOT_FOUND_RESPONSE,
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.commentsDocs = commentsDocs;
const COMMENT_SLUG_PARAM = (0, utils_1.generateParamExample)("slug", "Slug of the comment to fetch", "string", SLUG_EXAMPLE, "path");
const COMMENT_NOT_FOUND_RESPONSE = (0, utils_1.generateSwaggerResponseExample)("Comment Not Found response", base_1.FAILURE_STATUS, "Comment Does not exist", null, handlers_1.ErrorCode.NON_EXISTENT);
const commentsWithRepliesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch comment with replies',
        description: `Fetches a comment with its paginated replies`,
        parameters: [
            COMMENT_SLUG_PARAM,
            ...(0, utils_1.generatePaginationParamExample)("replies")
        ],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Replies fetched successful response', base_1.SUCCESS_STATUS, "Replies fetched", feed_1.CommentWithRepliesSchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Create a reply',
        description: `Allows authenticated users to create a reply`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Reply", feed_1.CommentCreateSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Reply created response', base_1.SUCCESS_STATUS, "Reply created", feed_1.ReplySchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update comment',
        description: `Allows authenticated users to update their comment`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Comment", feed_1.CommentCreateSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Comment updated response', base_1.SUCCESS_STATUS, "Comment updated", feed_1.CommentSchema),
            404: COMMENT_NOT_FOUND_RESPONSE,
            422: base_1.ERROR_EXAMPLE_422,
            400: (0, utils_1.generateSwaggerResponseExample)("Comment Not Yours response", base_1.FAILURE_STATUS, "Comment is not yours to edit", null, handlers_1.ErrorCode.INVALID_OWNER),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete comment',
        description: `Allows authenticated users to delete their comment`,
        parameters: [COMMENT_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Comment deleted response', base_1.SUCCESS_STATUS, "Comment deleted"),
            404: COMMENT_NOT_FOUND_RESPONSE,
            400: (0, utils_1.generateSwaggerResponseExample)("Comment Not Yours response", base_1.FAILURE_STATUS, "Comment is not yours to delete", null, handlers_1.ErrorCode.INVALID_OWNER),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.commentsWithRepliesDocs = commentsWithRepliesDocs;
const REPLY_SLUG_PARAM = (0, utils_1.generateParamExample)("slug", "Slug of the reply to fetch", "string", SLUG_EXAMPLE, "path");
const REPLY_NOT_FOUND_RESPONSE = (0, utils_1.generateSwaggerResponseExample)("Reply Not Found response", base_1.FAILURE_STATUS, "Reply Does not exist", null, handlers_1.ErrorCode.NON_EXISTENT);
const replyDocs = {
    get: {
        tags: tags,
        summary: 'Get single reply',
        description: `Get a single reply`,
        parameters: [REPLY_SLUG_PARAM],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Reply fetched successful response', base_1.SUCCESS_STATUS, "Reply fetched", feed_1.ReplySchema),
            404: REPLY_NOT_FOUND_RESPONSE,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Update a reply',
        description: `Allows authenticated users to update a reply`,
        parameters: [REPLY_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Reply", feed_1.CommentCreateSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Reply updated response', base_1.SUCCESS_STATUS, "Reply updated", feed_1.ReplySchema),
            404: REPLY_NOT_FOUND_RESPONSE,
            422: base_1.ERROR_EXAMPLE_422,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            400: (0, utils_1.generateSwaggerResponseExample)("Reply Not Yours response", base_1.FAILURE_STATUS, "Reply is not yours to update", null, handlers_1.ErrorCode.INVALID_OWNER),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete a reply',
        description: `Allows authenticated users to delete their reply`,
        parameters: [REPLY_SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Reply deleted response', base_1.SUCCESS_STATUS, "Reply deleted"),
            404: REPLY_NOT_FOUND_RESPONSE,
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            400: (0, utils_1.generateSwaggerResponseExample)("Reply Not Yours response", base_1.FAILURE_STATUS, "Reply is not yours to delete", null, handlers_1.ErrorCode.INVALID_OWNER),
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.replyDocs = replyDocs;
//# sourceMappingURL=feed.js.map