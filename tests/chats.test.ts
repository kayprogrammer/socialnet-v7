import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import TestAgent from "supertest/lib/agent";
import app from "..";
import mongoose from "mongoose";
import { BASE_URL, paginatedTestData, testAnotherVerifiedUser, testDMChat, testGroupChat, testMessage, testTokens, testVerifiedUser } from "./utils";
import { IUser } from "../models/accounts";
import { Chat, IChat } from "../models/chat";
import { convertSchemaData } from "../config/utils";
import { ChatSchema, MessageSchema } from "../schemas/chats";
import { ID_EXAMPLE, UserSchema } from "../schemas/base";
import { ErrorCode } from "../config/handlers";
import { shortUserPopulation } from "../managers/users";

describe('ChatsRoutes', () => {
  let mongoServer: MongoMemoryServer;
  const baseUrl: string = `${BASE_URL}/chats`
  let authRequestApp: TestAgent
  let user: IUser
  let user2: IUser

  let chat: IChat
  let groupChat: IChat

  beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
  
      user = await testVerifiedUser()
      const tokens = await testTokens(user)
      authRequestApp = request.agent(app).set('Authorization', `Bearer ${tokens.access}`)
  
      user2 = await testAnotherVerifiedUser()

      chat = await testDMChat(user, user2)
      groupChat = await testGroupChat(user, user2)
  });
  
  afterAll(async () => {
      await mongoose.disconnect();
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
        data: paginatedTestData("chats", convertSchemaData(ChatSchema, [groupChat, chat]))
      });
  });

  it('Should send a user message', async () => {
      const dataToSend = { chatId: ID_EXAMPLE, text: "whatsup" }
      // Check for an error returned due to invalid chatID
      let res = await authRequestApp.post(baseUrl).send(dataToSend);
      expect(res.statusCode).toBe(422);
      let respBody = res.body;
      expect(respBody).toMatchObject({
        status: "failure",
        message: "Invalid Entry",
        code: ErrorCode.INVALID_ENTRY,
        data: { chatId: "User has no chat with that ID" }
      });
  
      // Check for a successful update of the profile
      dataToSend.chatId = chat.toString()
      res = await authRequestApp.post(baseUrl).send(dataToSend);
      expect(res.statusCode).toBe(201);
      respBody = res.body;
      expect(respBody).toMatchObject({
        status: "success",
        message: "Message sent",
        data: {
          id: expect.any(String), chatId: chat.toString(),
          sender: convertSchemaData(UserSchema, user), text: dataToSend.text ,
          fileUrl: null, createdAt: expect.any(String), updatedAt: expect.any(String),
        }
      });
  });

  it('Should return chat messages', async () => {
      // Check for an error return due to invalid chat Id
      let res = await authRequestApp.get(`${baseUrl}/${ID_EXAMPLE}`);
      expect(res.statusCode).toBe(404);
      let respBody = res.body;
      expect(respBody).toMatchObject({
          status: "failure",
          message: "User has no chat with that ID",
          code: ErrorCode.NON_EXISTENT
      });

      // Check for a successful return of a chat with its messages
      const message = await testMessage(user, chat)
      const reloadedChat = await Chat.findOne({ _id: chat._id }).populate([shortUserPopulation("owner"), "image", {path: "latestMessage", populate: shortUserPopulation("sender")}]) as IChat// reload chat
      res = await authRequestApp.get(`${baseUrl}/${chat.toString()}`);
      expect(res.statusCode).toBe(200);
      respBody = res.body;
      expect(respBody).toMatchObject({
        status: "success",
        message: "Messages fetched",
        data: {
          chat: convertSchemaData(ChatSchema, reloadedChat),
          messages: paginatedTestData("items", convertSchemaData(MessageSchema, [message])),
          users: convertSchemaData(UserSchema, [user2])
        } 
      });
  });

  it('Should update a group chat', async () => {
    const dataToSend = { name: "Updated group name", description: "Updated group description" }
    // Check for an error return due to invalid chat Id
    let res = await authRequestApp.patch(`${baseUrl}/${chat.toString()}`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
        status: "failure",
        message: "User owns no group chat with that ID",
        code: ErrorCode.NON_EXISTENT
    });

    // Check for a successful update of a group chat
    const message = await testMessage(user, chat)
    const reloadedChat = await Chat.findOne({ _id: chat._id }).populate([shortUserPopulation("owner"), "image", {path: "latestMessage", populate: shortUserPopulation("sender")}]) as IChat// reload chat
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
        users: convertSchemaData(UserSchema, [user2]),
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
        code: ErrorCode.NON_EXISTENT
    });

    // Check for a successful deletion of a group chat
    res = await authRequestApp.delete(`${baseUrl}/${groupChat.toString()}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Group chat deleted" });
  });

  it('Should update a message', async () => {
    const dataToSend = { text: "Updated message" }
    // Check for an error return due to invalid message Id
    let res = await authRequestApp.put(`${baseUrl}/messages/${ID_EXAMPLE}`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
        status: "failure",
        message: "User has no message with that ID",
        code: ErrorCode.NON_EXISTENT
    });

    // Check for a successful update of a message
    const message = await testMessage(user, chat)
    res = await authRequestApp.put(`${baseUrl}/messages/${message.toString()}`).send(dataToSend);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Message updated",
      data: {
        id: expect.any(String), chatId: chat.toString(),
        sender: convertSchemaData(UserSchema, user), text: dataToSend.text,
        createdAt: expect.any(String), updatedAt: expect.any(String),
      } 
    });
  });

  it('Should delete a group message', async () => {
    // Check for an error return due to invalid message Id
    let res = await authRequestApp.delete(`${baseUrl}/messages/${ID_EXAMPLE}`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
        status: "failure",
        message: "User has no message with that ID",
        code: ErrorCode.NON_EXISTENT
    });

    // Check for a successful deletion of a message
    const message = await testMessage(user, chat)
    res = await authRequestApp.delete(`${baseUrl}/messages/${message.toString()}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Message deleted" });
  });

  it('Should create a group chat', async () => {
    const dataToSend = { name: "Updated group name", description: "Updated group description", usernamesToAdd: ["invalid_username"] }
    // Check for an error return due to invalid username Id
    let res = await authRequestApp.post(`${baseUrl}/groups/group`).send(dataToSend);
    expect(res.statusCode).toBe(422);
    let respBody = res.body;
    expect(respBody).toMatchObject({
        status: "failure",
        message: "Invalid Entry",
        code: ErrorCode.INVALID_ENTRY,
        data: { usernamesToAdd: "Enter at least one valid username" }
    });

    // Check for a successful creation of a group chat
    dataToSend.usernamesToAdd = [user2.username]
    res = await authRequestApp.post(`${baseUrl}/groups/group`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Group chat created",
      data: {
        id: expect.any(String), name: dataToSend.name, description: dataToSend.description,
        imageUrl: null, users: convertSchemaData(UserSchema, [user2]),
        createdAt: expect.any(String), updatedAt: expect.any(String)
      } 
    });
  });
})