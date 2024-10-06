import { ErrorCode } from "../config/handlers"
import { AcceptFriendRequestSchema, CitySchema, DeleteUserSchema, ProfileEditResponseSchema, ProfileEditSchema, ProfileSchema, ProfilesResponseSchema, SendFriendRequestSchema } from "../schemas/profiles"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generateParamExample, generateSwaggerExampleValue, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

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
    post: {
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

const NON_EXISENT_USER = generateSwaggerExampleValue('Non-Existent User', FAILURE_STATUS, "This user does not exist", null, ErrorCode.NON_EXISTENT)
const SEND_OR_DELETE_FRIEND_REQUEST_404_EXAMPLE = {
    description: "Non-Existent User/Friend-Request",
    content: {
        "application/json": {
            examples: {
                example1: NON_EXISENT_USER,
                example2: generateSwaggerExampleValue('Non-Existent Friend request', FAILURE_STATUS, "No pending friend request exist between you and that user", null, ErrorCode.NON_EXISTENT)
            }
        }
    }
}
const friendRequestsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch all friend requests',
        description: `Fetch a paginated result of all your friend requests.`,
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Friends Requests fetched successful response', SUCCESS_STATUS, "Friends Requests fetched", ProfilesResponseSchema, null),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },

    post: {
        tags: tags,
        summary: 'Send Or Delete Friend Request',
        description: `Allows an authenticated user to send or delete a friend request.`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Friend Request", SendFriendRequestSchema),
        responses: {
            201: generateSwaggerResponseExample('Friend request sent successful response', SUCCESS_STATUS, "Friend Request sent"),
            200: generateSwaggerResponseExample('Friend request deleted successful response', SUCCESS_STATUS, "Friend Request deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISENT_USER,
            403: generateSwaggerResponseExample('Existent Friend Request', FAILURE_STATUS, "This user already sent you a friend request", null, ErrorCode.NOT_ALLOWED),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },

    put: {
        tags: tags,
        summary: 'Accept or Reject a friend request',
        description: `Allows an authenticated user to accept or reject a friend request.`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Friend Request", AcceptFriendRequestSchema),
        responses: {
            200: generateSwaggerResponseExample('Friend Request Accepted/Rejected successful response', SUCCESS_STATUS, "Friend Request Accepted/Rejected"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: SEND_OR_DELETE_FRIEND_REQUEST_404_EXAMPLE,
            403: generateSwaggerResponseExample('Not-Allowed Action', FAILURE_STATUS, "You cannot accept or reject a friend request you sent", null, ErrorCode.NOT_ALLOWED),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

export { profilesDocs, citiesDocs, profileDocs, profileModifyDocs, friendsDocs, friendRequestsDocs }