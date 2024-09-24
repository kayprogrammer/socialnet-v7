import { PostCreateResponseSchema, PostCreateSchema, PostSchema, PostsResponseSchema } from "../schemas/feed";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, SUCCESS_STATUS } from "./base";
import { generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

const tags = ["Feed"]
const postsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch latest posts',
        description: "Fetch all the latest posts",
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

export { postsDocs }