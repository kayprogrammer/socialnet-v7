import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, paginatedTestData, testAnotherVerifiedUser, testComment, testPost, testReaction, testReply, testTokens, testVerifiedUser } from "./utils";
import { Comment, IComment, IPost, Post, REACTION_CHOICES_ENUM } from "../models/feed";
import { convertSchemaData } from "../config/utils";
import { CommentSchema, PostSchema, ReactionSchema, ReplySchema } from "../schemas/feed";
import { IUser } from "../models/accounts";
import TestAgent from "supertest/lib/agent";
import { UserSchema } from "../schemas/base";
import { ErrorCode } from "../config/handlers";
import { shortUserPopulation } from "../managers/users";

describe('FeedRoutes', () => {
  let mongoServer: MongoMemoryServer;
  const baseUrl: string = `${BASE_URL}/feed`
  const requestApp: TestAgent = request(app)
  let authRequestApp: TestAgent
  let authRequestApp2: TestAgent
  let user: IUser
  let user2: IUser

  let post: IPost
  let comment: IComment
  let reply: IComment
  let reaction: { rType: string; user: mongoose.Types.ObjectId | IUser; }


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    user = await testVerifiedUser()
    const tokens = await testTokens(user)
    authRequestApp = request.agent(app).set('Authorization', `Bearer ${tokens.access}`)

    // Another user
    user2 = await testAnotherVerifiedUser()
    const tokens2 = await testTokens(user2)
    authRequestApp2 = request.agent(app).set('Authorization', `Bearer ${tokens2.access}`)

    post = await testPost()
    reaction = await testReaction(post)
    comment = await testComment(post)
    post = await Post.findOne({ _id: post._id }).populate([shortUserPopulation("author"), "image", "commentsCount"]) as IPost // refresh post
    reply = await testReply(comment)
    comment = await Comment.findOne({ _id: comment._id }).populate([shortUserPopulation("author"), "replies"]) as IComment // refresh post
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
    const postToDelete = await testPost()
    res = await authRequestApp2.delete(`${baseUrl}/posts/${postToDelete.slug}`);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post is not yours to delete",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful deletion of the post
    res = await authRequestApp.delete(`${baseUrl}/posts/${postToDelete.slug}`);
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
    res = await authRequestApp.delete(`${baseUrl}/reactions/${post.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Reaction deleted" });
  });

  it('Should return comments of a post', async () => {
    // Check for an error return due to invalid post slug
    let res = await requestApp.get(`${baseUrl}/posts/invalid_slug/comments`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of post comments
    res = await requestApp.get(`${baseUrl}/posts/${post.slug}/comments`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Comments fetched",
      data: paginatedTestData("comments", convertSchemaData(CommentSchema, comment)) 
    });
  });

  it('Should create comment for a post', async () => {
    const dataToSend = { text: "This is my own comment" }
    // Check for an error return due to invalid post slug
    let res = await authRequestApp.post(`${baseUrl}/posts/invalid_slug/comments`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Post does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful creation of a post comment
    res = await authRequestApp.post(`${baseUrl}/posts/${post.slug}/comments`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Comment created",
      data: {
        author: convertSchemaData(UserSchema, user), slug: expect.any(String),
        text: dataToSend.text, reactionsCount: 0, repliesCount: 0,
        createdAt: expect.any(String), updatedAt: expect.any(String),
      } 
    });
  });

  it('Should return comment with replies', async () => {
    // Check for an error return due to invalid comment slug
    let res = await requestApp.get(`${baseUrl}/comments/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of a post comment with replies
    res = await requestApp.get(`${baseUrl}/comments/${comment.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Comment with replies fetched",
      data: {
        comment: convertSchemaData(CommentSchema, comment),
        replies: paginatedTestData("items", convertSchemaData(ReplySchema, reply))
      }
    });
  });

  it('Should create reply for a comment', async () => {
    const dataToSend = { text: "This is my own reply" }
    // Check for an error return due to invalid comment slug
    let res = await authRequestApp.post(`${baseUrl}/comments/invalid_slug`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful creation of a comment reply
    res = await authRequestApp.post(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reply created",
      data: {
        author: convertSchemaData(UserSchema, user), slug: expect.any(String),
        text: dataToSend.text, reactionsCount: 0,
        createdAt: expect.any(String), updatedAt: expect.any(String),
      } 
    });
  });

  it('Should update a comment', async () => {
    const dataToSend = { text: "This is my own updated comment" }
    // Check for an error return due to invalid comment slug
    let res = await authRequestApp.put(`${baseUrl}/comments/invalid_slug`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for error return due to invalid owner
    res = await authRequestApp2.put(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment is not yours to edit",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful update of a comment
    res = await authRequestApp.put(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Comment updated",
      data: {
        author: convertSchemaData(UserSchema, user), slug: expect.any(String),
        text: dataToSend.text, reactionsCount: 0, repliesCount: expect.any(Number),
        createdAt: expect.any(String), updatedAt: expect.any(String),
      } 
    });
  });

  it('Should delete a comment', async () => {
    // Check for an error return due to invalid comment slug
    let res = await authRequestApp.delete(`${baseUrl}/comments/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for error return due to invalid owner
    const commentToDelete = await testComment(post)
    res = await authRequestApp2.delete(`${baseUrl}/comments/${commentToDelete.slug}`);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Comment is not yours to delete",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful creation of a comment reply
    res = await authRequestApp.delete(`${baseUrl}/comments/${commentToDelete.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Comment deleted",
    });
  });

  it('Should return single reply', async () => {
    // Check for an error return due to invalid reply slug
    let res = await requestApp.get(`${baseUrl}/replies/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Reply does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of a post comment with replies
    res = await requestApp.get(`${baseUrl}/replies/${reply.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reply fetched",
      data: convertSchemaData(ReplySchema, reply),
    });
  });

  it('Should update a reply', async () => {
    const dataToSend = { text: "This is my own updated reply" }
    // Check for an error return due to invalid reply slug
    let res = await authRequestApp.put(`${baseUrl}/replies/invalid_slug`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Reply does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for error return due to invalid owner
    res = await authRequestApp2.put(`${baseUrl}/replies/${reply.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Reply is not yours to edit",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful update of a reply
    res = await authRequestApp.put(`${baseUrl}/replies/${reply.slug}`).send(dataToSend);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reply updated",
      data: {
        author: convertSchemaData(UserSchema, user), slug: expect.any(String),
        text: dataToSend.text, reactionsCount: 0,
        createdAt: expect.any(String), updatedAt: expect.any(String),
      } 
    });
  });

  it('Should delete a reply', async () => {
    // Check for an error return due to invalid reply slug
    let res = await authRequestApp.delete(`${baseUrl}/replies/invalid_slug`);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Reply does not exist",
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for error return due to invalid owner
    res = await authRequestApp2.delete(`${baseUrl}/replies/${reply.slug}`);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Reply is not yours to delete",
      code: ErrorCode.INVALID_OWNER
    });

    // Check for a successful creation of a comment reply
    res = await authRequestApp.delete(`${baseUrl}/replies/${reply.slug}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Reply deleted",
    });
  });
});