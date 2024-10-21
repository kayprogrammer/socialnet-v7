"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const __1 = __importDefault(require(".."));
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils");
const chat_1 = require("../models/chat");
const utils_2 = require("../config/utils");
const chats_1 = require("../schemas/chats");
const base_1 = require("../schemas/base");
const handlers_1 = require("../config/handlers");
const users_1 = require("../managers/users");
describe('ChatsRoutes', () => {
    let mongoServer;
    const baseUrl = `${utils_1.BASE_URL}/chats`;
    let authRequestApp;
    let user;
    let user2;
    let chat;
    let groupChat;
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        user = await (0, utils_1.testVerifiedUser)();
        const tokens = await (0, utils_1.testTokens)(user);
        authRequestApp = supertest_1.default.agent(__1.default).set('Authorization', `Bearer ${tokens.access}`);
        user2 = await (0, utils_1.testAnotherVerifiedUser)();
        chat = await (0, utils_1.testDMChat)(user, user2);
        groupChat = await (0, utils_1.testGroupChat)(user, user2);
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
    });
    it('Should return chats', async () => {
        // Check for a successful return of chats
        const res = await authRequestApp.get(baseUrl);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Chats fetched",
            data: (0, utils_1.paginatedTestData)("chats", (0, utils_2.convertSchemaData)(chats_1.ChatSchema, [groupChat, chat]))
        });
    });
    it('Should send a user message', async () => {
        const dataToSend = { chatId: base_1.ID_EXAMPLE, text: "whatsup" };
        // Check for an error returned due to invalid chatID
        let res = await authRequestApp.post(baseUrl).send(dataToSend);
        expect(res.statusCode).toBe(422);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Invalid Entry",
            code: handlers_1.ErrorCode.INVALID_ENTRY,
            data: { chatId: "User has no chat with that ID" }
        });
        // Check for a successful update of the profile
        dataToSend.chatId = chat.toString();
        res = await authRequestApp.post(baseUrl).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Message sent",
            data: {
                id: expect.any(String), chatId: chat.toString(),
                sender: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), text: dataToSend.text,
                fileUrl: null, createdAt: expect.any(String), updatedAt: expect.any(String),
            }
        });
    });
    it('Should return chat messages', async () => {
        // Check for an error return due to invalid chat Id
        let res = await authRequestApp.get(`${baseUrl}/${base_1.ID_EXAMPLE}`);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "User has no chat with that ID",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful return of a chat with its messages
        const message = await (0, utils_1.testMessage)(user, chat);
        const reloadedChat = await chat_1.Chat.findOne({ _id: chat._id }).populate([(0, users_1.shortUserPopulation)("owner"), "image", { path: "latestMessage", populate: (0, users_1.shortUserPopulation)("sender") }]); // reload chat
        res = await authRequestApp.get(`${baseUrl}/${chat.toString()}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Messages fetched",
            data: {
                chat: (0, utils_2.convertSchemaData)(chats_1.ChatSchema, reloadedChat),
                messages: (0, utils_1.paginatedTestData)("items", (0, utils_2.convertSchemaData)(chats_1.MessageSchema, [message])),
                users: (0, utils_2.convertSchemaData)(base_1.UserSchema, [user2])
            }
        });
    });
    it('Should update a group chat', async () => {
        const dataToSend = { name: "Updated group name", description: "Updated group description" };
        // Check for an error return due to invalid chat Id
        let res = await authRequestApp.patch(`${baseUrl}/${chat.toString()}`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "User owns no group chat with that ID",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful update of a group chat
        const message = await (0, utils_1.testMessage)(user, chat);
        const reloadedChat = await chat_1.Chat.findOne({ _id: chat._id }).populate([(0, users_1.shortUserPopulation)("owner"), "image", { path: "latestMessage", populate: (0, users_1.shortUserPopulation)("sender") }]); // reload chat
        res = await authRequestApp.patch(`${baseUrl}/${groupChat.toString()}`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Group chat updated",
            data: {
                id: groupChat.toString(),
                name: dataToSend.name,
                description: dataToSend.description,
                imageUrl: null,
                users: (0, utils_2.convertSchemaData)(base_1.UserSchema, [user2]),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            }
        });
    });
    it('Should delete a group chat', async () => {
        // Check for an error return due to invalid chat Id
        let res = await authRequestApp.delete(`${baseUrl}/${chat.toString()}`);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "User owns no group chat with that ID",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful deletion of a group chat
        res = await authRequestApp.delete(`${baseUrl}/${groupChat.toString()}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Group chat deleted" });
    });
    it('Should update a message', async () => {
        const dataToSend = { text: "Updated message" };
        // Check for an error return due to invalid message Id
        let res = await authRequestApp.put(`${baseUrl}/messages/${base_1.ID_EXAMPLE}`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "User has no message with that ID",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful update of a message
        const message = await (0, utils_1.testMessage)(user, chat);
        res = await authRequestApp.put(`${baseUrl}/messages/${message.toString()}`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Message updated",
            data: {
                id: expect.any(String), chatId: chat.toString(),
                sender: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), text: dataToSend.text,
                createdAt: expect.any(String), updatedAt: expect.any(String),
            }
        });
    });
    it('Should delete a group message', async () => {
        // Check for an error return due to invalid message Id
        let res = await authRequestApp.delete(`${baseUrl}/messages/${base_1.ID_EXAMPLE}`);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "User has no message with that ID",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful deletion of a message
        const message = await (0, utils_1.testMessage)(user, chat);
        res = await authRequestApp.delete(`${baseUrl}/messages/${message.toString()}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Message deleted" });
    });
    it('Should create a group chat', async () => {
        const dataToSend = { name: "Updated group name", description: "Updated group description", usernamesToAdd: ["invalid_username"] };
        // Check for an error return due to invalid username Id
        let res = await authRequestApp.post(`${baseUrl}/groups/group`).send(dataToSend);
        expect(res.statusCode).toBe(422);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Invalid Entry",
            code: handlers_1.ErrorCode.INVALID_ENTRY,
            data: { usernamesToAdd: "Enter at least one valid username" }
        });
        // Check for a successful creation of a group chat
        dataToSend.usernamesToAdd = [user2.username];
        res = await authRequestApp.post(`${baseUrl}/groups/group`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Group chat created",
            data: {
                id: expect.any(String), name: dataToSend.name, description: dataToSend.description,
                imageUrl: null, users: (0, utils_2.convertSchemaData)(base_1.UserSchema, [user2]),
                createdAt: expect.any(String), updatedAt: expect.any(String)
            }
        });
    });
});
//# sourceMappingURL=chats.test.js.map