"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const __1 = __importDefault(require(".."));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const utils_1 = require("./utils");
const feed_1 = require("../models/feed");
const utils_2 = require("../config/utils");
const feed_2 = require("../schemas/feed");
const base_1 = require("../schemas/base");
const handlers_1 = require("../config/handlers");
const users_1 = require("../managers/users");
describe('FeedRoutes', () => {
    let mongoServer;
    const baseUrl = `${utils_1.BASE_URL}/feed`;
    const requestApp = (0, supertest_1.default)(__1.default);
    let authRequestApp;
    let authRequestApp2;
    let user;
    let user2;
    let post;
    let comment;
    let reply;
    let reaction;
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        user = await (0, utils_1.testVerifiedUser)();
        const tokens = await (0, utils_1.testTokens)(user);
        authRequestApp = supertest_1.default.agent(__1.default).set('Authorization', `Bearer ${tokens.access}`);
        // Another user
        user2 = await (0, utils_1.testAnotherVerifiedUser)();
        const tokens2 = await (0, utils_1.testTokens)(user2);
        authRequestApp2 = supertest_1.default.agent(__1.default).set('Authorization', `Bearer ${tokens2.access}`);
        post = await (0, utils_1.testPost)();
        reaction = await (0, utils_1.testReaction)(post);
        comment = await (0, utils_1.testComment)(post);
        post = await feed_1.Post.findOne({ _id: post._id }).populate([(0, users_1.shortUserPopulation)("author"), "image", "commentsCount"]); // refresh post
        reply = await (0, utils_1.testReply)(comment);
        comment = await feed_1.Comment.findOne({ _id: comment._id }).populate([(0, users_1.shortUserPopulation)("author"), "replies"]); // refresh post
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
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
            data: (0, utils_1.paginatedTestData)("posts", (0, utils_2.convertSchemaData)(feed_2.PostSchema, [post]))
        });
    });
    it('Should create a post', async () => {
        // Check for a successful creation of a post
        const dataToSend = { text: "Here is my new post" };
        const res = await authRequestApp.post(`${baseUrl}/posts`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Post created",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user),
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of post details
        res = await requestApp.get(`${baseUrl}/posts/${post.slug}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Post details fetched",
            data: (0, utils_2.convertSchemaData)(feed_2.PostSchema, post)
        });
    });
    it('Should update a post', async () => {
        const dataToSend = { text: "This is me updating my post" };
        // Check for an error returned due to invalid slug
        let res = await authRequestApp.put(`${baseUrl}/posts/invalid_slug`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Post does not exist",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for an error returned due to invalid post owner
        res = await authRequestApp2.put(`${baseUrl}/posts/${post.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Post is not yours to edit",
            code: handlers_1.ErrorCode.INVALID_OWNER
        });
        // Check for a successful update of the post
        res = await authRequestApp.put(`${baseUrl}/posts/${post.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Post updated",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user),
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for an error returned due to invalid post owner
        const postToDelete = await (0, utils_1.testPost)();
        res = await authRequestApp2.delete(`${baseUrl}/posts/${postToDelete.slug}`);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Post is not yours to delete",
            code: handlers_1.ErrorCode.INVALID_OWNER
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of the post reactions
        res = await requestApp.get(`${baseUrl}/reactions/${post.slug}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Reactions fetched",
            data: (0, utils_1.paginatedTestData)("reactions", (0, utils_2.convertSchemaData)(feed_2.ReactionSchema, [reaction]))
        });
    });
    it('Should create a reaction for a post', async () => {
        // Check for an error returned due to invalid post slug
        const dataToSend = { rType: feed_1.REACTION_CHOICES_ENUM.LIKE };
        let res = await authRequestApp.post(`${baseUrl}/reactions/invalid_slug`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "No Post, Comment or Reply with that slug",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful creation of the post reaction
        res = await authRequestApp.post(`${baseUrl}/reactions/${post.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Reaction created",
            data: { user: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), rType: dataToSend.rType }
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of post comments
        res = await requestApp.get(`${baseUrl}/posts/${post.slug}/comments`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Comments fetched",
            data: (0, utils_1.paginatedTestData)("comments", (0, utils_2.convertSchemaData)(feed_2.CommentSchema, [comment]))
        });
    });
    it('Should create comment for a post', async () => {
        const dataToSend = { text: "This is my own comment" };
        // Check for an error return due to invalid post slug
        let res = await authRequestApp.post(`${baseUrl}/posts/invalid_slug/comments`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Post does not exist",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful creation of a post comment
        res = await authRequestApp.post(`${baseUrl}/posts/${post.slug}/comments`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Comment created",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), slug: expect.any(String),
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of a post comment with replies
        res = await requestApp.get(`${baseUrl}/comments/${comment.slug}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Comment with replies fetched",
            data: {
                comment: (0, utils_2.convertSchemaData)(feed_2.CommentSchema, comment),
                replies: (0, utils_1.paginatedTestData)("items", (0, utils_2.convertSchemaData)(feed_2.ReplySchema, [reply]))
            }
        });
    });
    it('Should create reply for a comment', async () => {
        const dataToSend = { text: "This is my own reply" };
        // Check for an error return due to invalid comment slug
        let res = await authRequestApp.post(`${baseUrl}/comments/invalid_slug`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Comment does not exist",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful creation of a comment reply
        res = await authRequestApp.post(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Reply created",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), slug: expect.any(String),
                text: dataToSend.text, reactionsCount: 0,
                createdAt: expect.any(String), updatedAt: expect.any(String),
            }
        });
    });
    it('Should update a comment', async () => {
        const dataToSend = { text: "This is my own updated comment" };
        // Check for an error return due to invalid comment slug
        let res = await authRequestApp.put(`${baseUrl}/comments/invalid_slug`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Comment does not exist",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for error return due to invalid owner
        res = await authRequestApp2.put(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Comment is not yours to edit",
            code: handlers_1.ErrorCode.INVALID_OWNER
        });
        // Check for a successful update of a comment
        res = await authRequestApp.put(`${baseUrl}/comments/${comment.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Comment updated",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), slug: expect.any(String),
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for error return due to invalid owner
        const commentToDelete = await (0, utils_1.testComment)(post);
        res = await authRequestApp2.delete(`${baseUrl}/comments/${commentToDelete.slug}`);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Comment is not yours to delete",
            code: handlers_1.ErrorCode.INVALID_OWNER
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of a post comment with replies
        res = await requestApp.get(`${baseUrl}/replies/${reply.slug}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Reply fetched",
            data: (0, utils_2.convertSchemaData)(feed_2.ReplySchema, reply),
        });
    });
    it('Should update a reply', async () => {
        const dataToSend = { text: "This is my own updated reply" };
        // Check for an error return due to invalid reply slug
        let res = await authRequestApp.put(`${baseUrl}/replies/invalid_slug`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Reply does not exist",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for error return due to invalid owner
        res = await authRequestApp2.put(`${baseUrl}/replies/${reply.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Reply is not yours to edit",
            code: handlers_1.ErrorCode.INVALID_OWNER
        });
        // Check for a successful update of a reply
        res = await authRequestApp.put(`${baseUrl}/replies/${reply.slug}`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Reply updated",
            data: {
                author: (0, utils_2.convertSchemaData)(base_1.UserSchema, user), slug: expect.any(String),
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
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for error return due to invalid owner
        res = await authRequestApp2.delete(`${baseUrl}/replies/${reply.slug}`);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Reply is not yours to delete",
            code: handlers_1.ErrorCode.INVALID_OWNER
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
//# sourceMappingURL=feed.test.js.map