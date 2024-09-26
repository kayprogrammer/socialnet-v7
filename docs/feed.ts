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

const postDetailDocs = {
    get: {
        tags: tags,
        summary: 'Get post details',
        description: "Fetch details of a single post.",
        parameters: [
            generateParamExample("slug", "Slug of the post to fetch", "string", SLUG_EXAMPLE, "path"),
        ],
        responses: {
            200: generateSwaggerResponseExample('Post detail fetched successful response', SUCCESS_STATUS, "Post details fetched", PostsResponseSchema),
            404: generateSwaggerResponseExample("Post Not Found response", FAILURE_STATUS, "Post Does not exist", null, ErrorCode.NON_EXISTENT),
            500: ERROR_EXAMPLE_500
        }
    },
};

export { postsDocs, postDetailDocs }