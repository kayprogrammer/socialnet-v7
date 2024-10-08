import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPES } from "../config/file_processors"
import { ErrorCode } from "../config/handlers"
import { ID_EXAMPLE } from "../schemas/base"
import { ChatsResponseSchema, GroupChatInputResponseSchema, GroupCreateSchema, GroupUpdateSchema, MessageSentResponseSchema, MessagesResponseSchema, SendMessageSchema, UpdateMessageSchema } from "../schemas/chats"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Chats (8)"]

const chatsDocs = {
    get: {
        tags: tags,
        summary: 'Fetch user chats',
        description: `
            This endpoint retrieves a paginated list of the current user chats
            Only chat with type "GROUP" have name, image and description.
        `,
        security: [{ BearerAuth: [] }],
        parameters: generatePaginationParamExample("chats"),
        responses: {
            200: generateSwaggerResponseExample('Chats fetched successful response', SUCCESS_STATUS, "Chats fetched", ChatsResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
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
            ALLOWED FILE TYPES: ${Object.values(ALLOWED_FILE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Send Message", SendMessageSchema),
        responses: {
            201: generateSwaggerResponseExample('Message sent successful response', SUCCESS_STATUS, "Message sent", MessageSentResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },
}

const NON_EXISTENT_CHAT_ID = generateSwaggerResponseExample('Non-Existent chat error response', FAILURE_STATUS, "User has no chat with that ID", null, ErrorCode.NON_EXISTENT)

const CHAT_ID_FOR_MESSAGES_PARAM = generateParamExample("id", "ID of the chat", "string", ID_EXAMPLE, "path")

const messagesDocs = {
    get: {
        tags: tags,
        summary: 'Fetch chat messages',
        description: `
            This endpoint retrieves all messages in a chat.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [CHAT_ID_FOR_MESSAGES_PARAM ,...generatePaginationParamExample("messages")],
        responses: {
            200: generateSwaggerResponseExample('Messages fetched successful response', SUCCESS_STATUS, "Messages fetched", MessagesResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            500: ERROR_EXAMPLE_500
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
        requestBody: generateSwaggerRequestExample("Update Group", GroupUpdateSchema),
        responses: {
            200: generateSwaggerResponseExample('Group chat updated successful response', SUCCESS_STATUS, "Group chat updated", GroupChatInputResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
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
            200: generateSwaggerResponseExample('Group chat deleted successful response', SUCCESS_STATUS, "Group chat deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_CHAT_ID,
            500: ERROR_EXAMPLE_500
        }
    }
}

const NON_EXISTENT_MESSAGE_ID = generateSwaggerResponseExample('Non-Existent message error response', FAILURE_STATUS, "User has no message with that ID", null, ErrorCode.NON_EXISTENT)
const MESSAGE_ID_PARAM = generateParamExample("id", "ID of the message", "string", ID_EXAMPLE, "path")

const messageDocs = {
    put: {
        tags: tags,
        summary: 'Update Message',
        description: `
            This endpoint updates a message.
            You must either send a text or a file or both.
            The file_upload_data in the response is what is used for uploading the file to cloudinary from client
            ALLOWED FILE TYPES: ${Object.values(ALLOWED_FILE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        parameters: [MESSAGE_ID_PARAM],
        requestBody: generateSwaggerRequestExample("Update Message", UpdateMessageSchema),
        responses: {
            200: generateSwaggerResponseExample('Message updated successful response', SUCCESS_STATUS, "Message updated", MessageSentResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_MESSAGE_ID,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
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
            200: generateSwaggerResponseExample('Message deleted successful response', SUCCESS_STATUS, "Message deleted"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: NON_EXISTENT_MESSAGE_ID,
            500: ERROR_EXAMPLE_500
        }
    }
}

const groupCreateDocs = {
    post: {
        tags: tags,
        summary: 'Create Group chat',
        description: `
            This endpoint creates a group chat.
            The usernamesToAdd field should be a list of usernames you want to add to the group.
            Note: You cannot add more than 99 users in a group (1 owner + 99 other users = 100 users total)
            The file_upload_data in the response is what is used for uploading the file to cloudinary from client
            ALLOWED FILE TYPES: ${Object.values(ALLOWED_IMAGE_TYPES)}
        `,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Create Group", GroupCreateSchema),
        responses: {
            201: generateSwaggerResponseExample('Group created successful response', SUCCESS_STATUS, "Group created", GroupChatInputResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

export { chatsDocs, messagesDocs, messageDocs, groupCreateDocs }