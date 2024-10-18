import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, paginatedTestData, testAnotherVerifiedUser, testPost, testReaction, testTokens, testVerifiedUser } from "./utils";
import { IPost, Post, REACTION_CHOICES_ENUM } from "../models/feed";
import { convertSchemaData } from "../config/utils";
import { PostSchema, ReactionSchema } from "../schemas/feed";
import { IUser } from "../models/accounts";
import TestAgent from "supertest/lib/agent";
import { UserSchema } from "../schemas/base";
import { ErrorCode } from "../config/handlers";

describe('FeedRoutes', () => {
  let mongoServer: MongoMemoryServer;
  const baseUrl: string = `${BASE_URL}/feed`
  let post: IPost
  const requestApp: TestAgent = request(app)
  let authRequestApp: TestAgent
  let authRequestApp2: TestAgent
  let user: IUser
  let user2: IUser

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    post = await testPost()
    user = await testVerifiedUser()
    const tokens = await testTokens(user)
    authRequestApp = request.agent(app).set('Authorization', `Bearer ${tokens.access}`)

    // Another user
    user2 = await testAnotherVerifiedUser()
    const tokens2 = await testTokens(user2)
    authRequestApp2 = request.agent(app).set('Authorization', `Bearer ${tokens2.access}`)
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return latest posts', async () => {
    // Check for a successful return of posts
    const res = await requestApp.get(`${baseUrl}/posts`);
    expect(res.statusCode).toBe(200);
    const respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Posts fetched",
      data: paginatedTestData("posts", convertSchemaData(PostSchema, post))
    });
  });

  it('Should create a post', async () => {
    // Check for a successful creation of a post
    const dataToSend = { text: "Here is my new post" }
    const res = await authRequestApp.post(`${baseUrl}/posts`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    const respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Post created",
      data: {
        author: convertSchemaData(UserSchema, user),
        slug: expect.any(String),
        text: dataToSend.text,
        imageUrl: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('Should return a post detail', async () => {
    // Check for an error return due to invalid slug
    let res = await requestApp.get(`${baseUrl}/posts/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of post details
    res = await requestApp.get(`${baseUrl}/posts/${post.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Post details fetched",
      data: convertSchemaData(PostSchema, post)
    });
  });

  it('Should update a post', async () => {
    const dataToSend = { text: "This is me updating my post" }
    // Check for an error returned due to invalid slug
    let res = await authRequestApp.put(`${baseUrl}/posts/invalid_slug`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for an error returned due to invalid post owner
    res = await authRequestApp2.put(`${baseUrl}/posts/${post.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post is not yours to edit",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful update of the post
    res = await authRequestApp.put(`${baseUrl}/posts/${post.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Post updated",
      data: {
        author: convertSchemaData(UserSchema, user),
        slug: post.slug,
        text: dataToSend.text,
        imageUrl: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      }
    });
  });

  it('Should delete a post', async () => {
    // Check for an error returned due to invalid slug
    let res = await authRequestApp.delete(`${baseUrl}/posts/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for an error returned due to invalid post owner
    res = await authRequestApp2.delete(`${baseUrl}/posts/${post.slug}`);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post is not yours to delete",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful deletion of the post
    res = await authRequestApp.delete(`${baseUrl}/posts/${post.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Post deleted",
    });
  });

  it('Should return all reactions of a post', async () => {
    // Check for an error returned due to invalid post slug
    let res = await requestApp.get(`${baseUrl}/reactions/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "No Post, Comment or Reply with that slug",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of the post reactions
    post = await testPost() 
    const reaction = await testReaction(post)
    res = await requestApp.get(`${baseUrl}/reactions/${post.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reactions fetched",
      data: paginatedTestData("reactions", convertSchemaData(ReactionSchema, reaction))
    });
  });

  it('Should create a reaction for a post', async () => {
    // Check for an error returned due to invalid post slug
    const dataToSend = { rType: REACTION_CHOICES_ENUM.LIKE }
    let res = await authRequestApp.post(`${baseUrl}/reactions/invalid_slug`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "No Post, Comment or Reply with that slug",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful creation of the post reaction
    post = await testPost() 
    res = await authRequestApp.post(`${baseUrl}/reactions/${post.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reaction created",
      data: { user: convertSchemaData(UserSchema, user), rType: dataToSend.rType }
    });
  });

  it('Should delete a reaction for a post', async () => {
    // Check for an error returned due to invalid post slug
    let res = await authRequestApp.delete(`${baseUrl}/reactions/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "No Post, Comment or Reply with that slug",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful creation of the post reaction
    post = await testPost() // From the previous test. Not a right approach generally though. Tests shouldn't primarily depend on each other I think 🤔.
    res = await authRequestApp.delete(`${baseUrl}/reactions/${post.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Reaction deleted" });
  });
});