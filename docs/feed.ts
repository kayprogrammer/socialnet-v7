import { ErrorCode } from "../config/handlers";
import { PostCreateResponseSchema, PostCreateSchema, PostSchema, PostsResponseSchema } from "../schemas/feed";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

const tags = ["Feed"]
const postsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest posts',
        description: "Fetch all the latest posts",
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
        description: "Allows authenticated users to create a post",
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Post", PostCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Posts created response', SUCCESS_STATUS, "Post created", PostCreateResponseSchema),
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
        description: "Fetch details of a single post.",
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
        description: "Allows authenticated users to update a post",
        security: [{ BearerAuth: [] }],
        parameters: [SLUG_PARAM],
        requestBody: generateSwaggerRequestExample("Post", PostCreateSchema),
        responses: {
            200: generateSwaggerResponseExample('Posts updated response', SUCCESS_STATUS, "Post updated", PostCreateResponseSchema),
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
        description: "Allow auth users to delete a single post.",
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

export { postsDocs, postDetailDocs }