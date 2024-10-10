import { ALLOWED_FILE_TYPES } from "../config/file_processors"
import { ErrorCode } from "../config/handlers"
import { ID_EXAMPLE } from "../schemas/base"
import { ChatsResponseSchema, MessageSentResponseSchema, MessagesResponseSchema, SendMessageSchema } from "../schemas/chats"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Chats (11)"]

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
}
export { chatsDocs, messagesDocs }