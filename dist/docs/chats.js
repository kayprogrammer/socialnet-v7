"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupCreateDocs = exports.messageDocs = exports.messagesDocs = exports.chatsDocs = void 0;
const file_processors_1 = require("../config/file_processors");
const handlers_1 = require("../config/handlers");
const base_1 = require("../schemas/base");
const chats_1 = require("../schemas/chats");
const base_2 = require("./base");
const utils_1 = require("./utils");
const tags = ["Chats (8)"];
const chatsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch user chats',
        description: `
            This endpoint retrieves a paginated list of the current user chats
            Only chat with type "GROUP" have name, image and description.
        `,
        security: [{ BearerAuth: [] }],
        parameters: (0, utils_1.generatePaginationParamExample)("chats"),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Chats fetched successful response', base_2.SUCCESS_STATUS, "Chats fetched", chats_1.ChatsResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_2.ERROR_EXAMPLE_500
        }
    },
    post: {
        tags: tags,
        summary: 'Send a message',
        description: `
            This endpoint sends a message.
            You must either send a text or a file or both.
            If there's no chatId, then its a new chat and you must set username and leave chatId
            If chatId is available, then ignore username and set the correct chatId
            The fileUploadData in the response is what is used for uploading the file to cloudinary from client
            ALLOWED FILE TYPES: ${Object.values(file_processors_1.ALLOWED_FILE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Send Message", chats_1.SendMessageSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Message sent successful response', base_2.SUCCESS_STATUS, "Message sent", chats_1.MessageSentResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: base_2.ERROR_EXAMPLE_422,
            500: base_2.ERROR_EXAMPLE_500
        }
    },
};
exports.chatsDocs = chatsDocs;
const NON_EXISTENT_CHAT_ID = (0, utils_1.generateSwaggerResponseExample)('Non-Existent chat error response', base_2.FAILURE_STATUS, "User has no chat with that ID", null, handlers_1.ErrorCode.NON_EXISTENT);
const CHAT_ID_FOR_MESSAGES_PARAM = (0, utils_1.generateParamExample)("id", "ID of the chat", "string", base_1.ID_EXAMPLE, "path");
const messagesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch chat messages',
        description: `
            This endpoint retrieves all messages in a chat.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [CHAT_ID_FOR_MESSAGES_PARAM, ...(0, utils_1.generatePaginationParamExample)("messages")],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Messages fetched successful response', base_2.SUCCESS_STATUS, "Messages fetched", chats_1.MessagesResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            500: base_2.ERROR_EXAMPLE_500
        }
    },
    patch: {
        tags: tags,
        summary: 'Update Group chat',
        description: `
            This endpoint allows a user to edit his group chat.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [CHAT_ID_FOR_MESSAGES_PARAM],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Update Group", chats_1.GroupUpdateSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Group chat updated successful response', base_2.SUCCESS_STATUS, "Group chat updated", chats_1.GroupChatInputResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            422: base_2.ERROR_EXAMPLE_422,
            500: base_2.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete Group chat',
        description: `
            This endpoint allows a user to delete his group chat.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [CHAT_ID_FOR_MESSAGES_PARAM],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Group chat deleted successful response', base_2.SUCCESS_STATUS, "Group chat deleted"),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.messagesDocs = messagesDocs;
const NON_EXISTENT_MESSAGE_ID = (0, utils_1.generateSwaggerResponseExample)('Non-Existent message error response', base_2.FAILURE_STATUS, "User has no message with that ID", null, handlers_1.ErrorCode.NON_EXISTENT);
const MESSAGE_ID_PARAM = (0, utils_1.generateParamExample)("id", "ID of the message", "string", base_1.ID_EXAMPLE, "path");
const messageDocs = {
    put: {
        tags: tags,
        summary: 'Update Message',
        description: `
            This endpoint updates a message.
            You must either send a text or a file or both.
            The file_upload_data in the response is what is used for uploading the file to cloudinary from client
            ALLOWED FILE TYPES: ${Object.values(file_processors_1.ALLOWED_FILE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        parameters: [MESSAGE_ID_PARAM],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Update Message", chats_1.UpdateMessageSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Message updated successful response', base_2.SUCCESS_STATUS, "Message updated", chats_1.MessageSentResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_MESSAGE_ID,
            422: base_2.ERROR_EXAMPLE_422,
            500: base_2.ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags: tags,
        summary: 'Delete Message',
        description: `
            This endpoint allows a user to delete his message.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [MESSAGE_ID_PARAM],
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Message deleted successful response', base_2.SUCCESS_STATUS, "Message deleted"),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_MESSAGE_ID,
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.messageDocs = messageDocs;
const groupCreateDocs = {
    post: {
        tags: tags,
        summary: 'Create Group chat',
        description: `
            This endpoint creates a group chat.
            The usernamesToAdd field should be a list of usernames you want to add to the group.
            Note: You cannot add more than 99 users in a group (1 owner + 99 other users = 100 users total)
            The file_upload_data in the response is what is used for uploading the file to cloudinary from client
            ALLOWED FILE TYPES: ${Object.values(file_processors_1.ALLOWED_IMAGE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Create Group", chats_1.GroupCreateSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Group created successful response', base_2.SUCCESS_STATUS, "Group created", chats_1.GroupChatInputResponseSchema),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: base_2.ERROR_EXAMPLE_422,
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.groupCreateDocs = groupCreateDocs;
//# sourceMappingURL=chats.js.map