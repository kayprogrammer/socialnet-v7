import { ErrorCode } from "../config/handlers"
import { CitySchema, DeleteUserSchema, ProfileEditResponseSchema, ProfileEditSchema, ProfileSchema, ProfilesResponseSchema } from "../schemas/profiles"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Profiles (17)"]

const profilesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch users',
        description: `Fetch all users closer to you`,
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Users fetched successful response', SUCCESS_STATUS, "Users fetched", ProfilesResponseSchema, null),
            500: ERROR_EXAMPLE_500
        }
    },
}

const citiesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch cities',
        description: `Fetch all cities based on query params`,
        parameters: [
            generateParamExample("city", "Fetch cities based on name or substring", "string", "La"),
        ],
        responses: {
            200: generateSwaggerResponseExample('Cities fetched successful response', SUCCESS_STATUS, "Cities fetched", CitySchema, null, true),
            500: ERROR_EXAMPLE_500
        }
    },
}

const profileDocs = {
    get: {
        tags: tags,
        summary: 'Get user profile',
        description: `Get a single user profile based on the username`,
        parameters: [
            generateParamExample("username", "Get user based on username", "string", "john-doe", "path"),
        ],
        responses: {
            200: generateSwaggerResponseExample('User fetched successful response', SUCCESS_STATUS, "User fetched", ProfileSchema),
            404: generateSwaggerResponseExample('User not found response', FAILURE_STATUS, "No user with that username", null, ErrorCode.NON_EXISTENT),
            500: ERROR_EXAMPLE_500
        }
    },
}

const profileModifyDocs = {
    patch: {
        tags: tags,
        summary: 'Update a user profile',
        description: `Allows an authenticated user to update his profile.`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Profile", ProfileEditSchema),
        responses: {
            200: generateSwaggerResponseExample('Profile updated successful response', SUCCESS_STATUS, "Profile updated", ProfileEditResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete a user profile',
        description: `Allows an authenticated user to irreversibly delete his profile.`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Profile Delete", DeleteUserSchema),
        responses: {
            200: generateSwaggerResponseExample('Profile deleted successful response', SUCCESS_STATUS, "Profile deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const friendsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch your friends',
        description: `Fetch a paginated result of all your friends.`,
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Friends fetched successful response', SUCCESS_STATUS, "Friends fetched", ProfilesResponseSchema, null),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
}

export { profilesDocs, citiesDocs, profileDocs, profileModifyDocs, friendsDocs }