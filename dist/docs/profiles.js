"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsDocs = exports.friendRequestsDocs = exports.friendsDocs = exports.profileModifyDocs = exports.profileDocs = exports.citiesDocs = exports.profilesDocs = void 0;
const handlers_1 = require("../config/handlers");
const profiles_1 = require("../schemas/profiles");
const base_1 = require("./base");
const utils_1 = require("./utils");
const tags = ["Profiles (11)"];
const profilesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch users',
        description: `Fetch all the paginated users closest to you`,
        security: [{ BearerAuth: [] }],
        parameters: (0, utils_1.generatePaginationParamExample)("users"),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Users fetched successful response', base_1.SUCCESS_STATUS, "Users fetched", profiles_1.ProfilesResponseSchema, null),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.profilesDocs = profilesDocs;
const citiesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch cities',
        description: `Fetch all cities based on query params`,
        parameters: [
            (0, utils_1.generateParamExample)("city", "Fetch cities based on name or substring", "string", "La"),
        ],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Cities fetched successful response', base_1.SUCCESS_STATUS, "Cities fetched", profiles_1.CitySchema, null, true),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.citiesDocs = citiesDocs;
const profileDocs = {
    get: {
        tags: tags,
        summary: 'Get user profile',
        description: `Get a single user profile based on the username`,
        parameters: [
            (0, utils_1.generateParamExample)("username", "Get user based on username", "string", "john-doe", "path"),
        ],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('User fetched successful response', base_1.SUCCESS_STATUS, "User fetched", profiles_1.ProfileSchema),
            404: (0, utils_1.generateSwaggerResponseExample)('User not found response', base_1.FAILURE_STATUS, "No user with that username", null, handlers_1.ErrorCode.NON_EXISTENT),
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.profileDocs = profileDocs;
const profileModifyDocs = {
    patch: {
        tags: tags,
        summary: 'Update a user profile',
        description: `Allows an authenticated user to update his profile.`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Profile", profiles_1.ProfileEditSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Profile updated successful response', base_1.SUCCESS_STATUS, "Profile updated", profiles_1.ProfileEditResponseSchema),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: base_1.ERROR_EXAMPLE_422,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Delete a user profile',
        description: `Allows an authenticated user to irreversibly delete his profile.`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Profile Delete", profiles_1.DeleteUserSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Profile deleted successful response', base_1.SUCCESS_STATUS, "Profile deleted"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: base_1.ERROR_EXAMPLE_422,
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.profileModifyDocs = profileModifyDocs;
const friendsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch your friends',
        description: `Fetch a paginated result of all your friends.`,
        security: [{ BearerAuth: [] }],
        parameters: (0, utils_1.generatePaginationParamExample)("friends"),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Friends fetched successful response', base_1.SUCCESS_STATUS, "Friends fetched", profiles_1.ProfilesResponseSchema, null),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.friendsDocs = friendsDocs;
const NON_EXISENT_USER = (0, utils_1.generateSwaggerExampleValue)('Non-Existent User', base_1.FAILURE_STATUS, "This user does not exist", null, handlers_1.ErrorCode.NON_EXISTENT);
const SEND_OR_DELETE_FRIEND_REQUEST_404_EXAMPLE = {
    description: "Non-Existent User/Friend-Request",
    content: {
        "application/json": {
            examples: {
                example1: NON_EXISENT_USER,
                example2: (0, utils_1.generateSwaggerExampleValue)('Non-Existent Friend request', base_1.FAILURE_STATUS, "No pending friend request exist between you and that user", null, handlers_1.ErrorCode.NON_EXISTENT)
            }
        }
    }
};
const friendRequestsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch all friend requests',
        description: `Fetch a paginated result of all your friend requests.`,
        security: [{ BearerAuth: [] }],
        parameters: (0, utils_1.generatePaginationParamExample)("friend requests"),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Friends Requests fetched successful response', base_1.SUCCESS_STATUS, "Friends Requests fetched", profiles_1.ProfilesResponseSchema, null),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Send Or Delete Friend Request',
        description: `Allows an authenticated user to send or delete a friend request.`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Friend Request", profiles_1.SendFriendRequestSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Friend request sent successful response', base_1.SUCCESS_STATUS, "Friend Request sent"),
            200: (0, utils_1.generateSwaggerResponseExample)('Friend request deleted successful response', base_1.SUCCESS_STATUS, "Friend Request deleted"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISENT_USER,
            403: (0, utils_1.generateSwaggerResponseExample)('Existent Friend Request', base_1.FAILURE_STATUS, "This user already sent you a friend request", null, handlers_1.ErrorCode.NOT_ALLOWED),
            422: base_1.ERROR_EXAMPLE_422,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    put: {
        tags: tags,
        summary: 'Accept or Reject a friend request',
        description: `Allows an authenticated user to accept or reject a friend request.`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Friend Request", profiles_1.AcceptFriendRequestSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Friend Request Accepted/Rejected successful response', base_1.SUCCESS_STATUS, "Friend Request Accepted/Rejected"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: SEND_OR_DELETE_FRIEND_REQUEST_404_EXAMPLE,
            403: (0, utils_1.generateSwaggerResponseExample)('Not-Allowed Action', base_1.FAILURE_STATUS, "You cannot accept or reject a friend request you sent", null, handlers_1.ErrorCode.NOT_ALLOWED),
            422: base_1.ERROR_EXAMPLE_422,
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
exports.friendRequestsDocs = friendRequestsDocs;
const notificationsDocs = {
    get: {
        tags: tags,
        summary: 'Retrieve all user notifications',
        description: `
            Allows a user to retrieve a paginated result of their notifications.
            Note:
                - Use post slug to navigate to the post.
                - Use comment slug to navigate to the comment.
                - Use reply slug to navigate to the reply.
        `,
        parameters: (0, utils_1.generatePaginationParamExample)("notifications"),
        security: [{ BearerAuth: [] }],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Notifications fetched successful response', base_1.SUCCESS_STATUS, "Notifications fetched", profiles_1.NotificationsResponseSchema, null),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Read notification',
        description: `Allows an authenticated user to read a notification or mark all as read.`,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Notification", profiles_1.ReadNotificationSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Notification read successful response', base_1.SUCCESS_STATUS, "Notifications read"),
            401: base_1.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: (0, utils_1.generateSwaggerResponseExample)('Non-Existent Notification', base_1.FAILURE_STATUS, "User has no notifications with that ID", null, handlers_1.ErrorCode.NON_EXISTENT),
            422: base_1.ERROR_EXAMPLE_422,
            500: base_1.ERROR_EXAMPLE_500
        }
    },
};
exports.notificationsDocs = notificationsDocs;
//# sourceMappingURL=profiles.js.map