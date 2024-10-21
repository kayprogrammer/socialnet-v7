"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const utils_1 = require("./utils");
const __1 = __importDefault(require(".."));
const mongoose_1 = __importDefault(require("mongoose"));
const profiles_1 = require("../schemas/profiles");
const utils_2 = require("../config/utils");
const handlers_1 = require("../config/handlers");
const base_1 = require("../schemas/base");
const profiles_2 = require("../models/profiles");
const users_1 = require("../managers/users");
describe('ProfilesRoutes', () => {
    let mongoServer;
    const baseUrl = `${utils_1.BASE_URL}/profiles`;
    const requestApp = (0, supertest_1.default)(__1.default);
    let authRequestApp;
    let user;
    let user2;
    let city;
    let notification;
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        user = await (0, utils_1.testVerifiedUser)();
        const tokens = await (0, utils_1.testTokens)(user);
        authRequestApp = supertest_1.default.agent(__1.default).set('Authorization', `Bearer ${tokens.access}`);
        // Another user
        user2 = await (0, utils_1.testAnotherVerifiedUser)();
        city = await (0, utils_1.testCity)();
        await (0, utils_1.testFriend)(user2, user);
        notification = await (0, utils_1.testNotification)(user2, user);
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
    });
    it('Should return users', async () => {
        // Check for a successful return of users
        const res = await requestApp.get(baseUrl);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Users fetched",
            data: (0, utils_1.paginatedTestData)("users", (0, utils_2.convertSchemaData)(profiles_1.ProfileSchema, [user, user2]))
        });
    });
    it('Should return cities', async () => {
        // Check for a successful return of users
        const res = await requestApp.get(`${baseUrl}/cities/?city=${city.name}`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Cities Fetched",
            data: (0, utils_2.convertSchemaData)(profiles_1.CitySchema, [city])
        });
    });
    it('Should return a user profile', async () => {
        // Check for an error returned due to invalid username
        let res = await requestApp.get(`${baseUrl}/profile/invalid_username`);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "No user with that username",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Check for a successful return of the user profile
        res = await requestApp.get(`${baseUrl}/profile/${user.username}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "User details fetched",
            data: (0, utils_2.convertSchemaData)(profiles_1.ProfileSchema, user)
        });
    });
    it('Should update a user profile', async () => {
        const dataToSend = { firstName: "Name", lastName: "Updated", bio: "I'm the best", cityId: base_1.ID_EXAMPLE };
        // Check for an error returned due to invalid city ID
        let res = await authRequestApp.patch(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(422);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Invalid Entry",
            code: handlers_1.ErrorCode.INVALID_ENTRY,
            data: { cityId: "No city with that ID" }
        });
        // Check for a successful update of the profile
        dataToSend.cityId = city.id.toString();
        res = await authRequestApp.patch(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Profile updated",
            data: {
                firstName: dataToSend.firstName, lastName: dataToSend.lastName,
                username: `${dataToSend.firstName}-${dataToSend.lastName}`.toLowerCase(),
                email: user.email, avatarUrl: null,
                bio: dataToSend.bio, dob: user.dob, city: city.name,
                createdAt: expect.any(String), updatedAt: expect.any(String),
            }
        });
    });
    it('Should delete a user profile', async () => {
        const userToDeleteData = { firstName: "Test", lastName: "UserDel", email: "testdel@email.com", password: "testdel" };
        const userToDelete = await (0, users_1.createUser)(userToDeleteData, true);
        const tokens = await (0, utils_1.testTokens)(userToDelete);
        const reqApp = supertest_1.default.agent(__1.default).set('Authorization', `Bearer ${tokens.access}`);
        const dataToSend = { password: "invalid_password" };
        // Check for an error returned due to invalid password
        let res = await reqApp.post(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(422);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Invalid Entry",
            code: handlers_1.ErrorCode.INVALID_ENTRY,
            data: { password: "Incorrect password" }
        });
        // Check for a successful deletion of the profile
        dataToSend.password = userToDeleteData.password;
        res = await reqApp.post(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Profile deleted" });
    });
    it('Should return friends', async () => {
        // Check for a successful return of friends
        const res = await authRequestApp.get(`${baseUrl}/friends`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Friends fetched",
            data: (0, utils_1.paginatedTestData)("users", (0, utils_2.convertSchemaData)(profiles_1.ProfileSchema, [user2]))
        });
    });
    it('Should return friend requests', async () => {
        await (0, utils_1.testFriend)(user2, user, profiles_2.FRIEND_REQUEST_STATUS_CHOICES.PENDING); // Set friendship to pending
        // Check for a successful return of friends
        const res = await authRequestApp.get(`${baseUrl}/friends/requests`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Friends Requests fetched",
            data: (0, utils_1.paginatedTestData)("users", (0, utils_2.convertSchemaData)(profiles_1.ProfileSchema, [user2]))
        });
    });
    it('Should send friend requests', async () => {
        const dataToSend = { username: user2.username };
        // Return error if the user you are trying to be-friend has already sent a request 
        let res = await authRequestApp.post(`${baseUrl}/friends/requests`).send(dataToSend);
        expect(res.statusCode).toBe(403);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "This user already sent you a friend request",
            code: handlers_1.ErrorCode.NOT_ALLOWED
        });
        // Check for a successful sending of friend request
        await profiles_2.Friend.deleteMany({}); // Delete any existing friend
        res = await authRequestApp.post(`${baseUrl}/friends/requests`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Friend Request sent" });
    });
    it('Should accept friend request', async () => {
        const dataToSend = { username: user2.username, accepted: true };
        // Return error if no existing pending request btw you and user 
        await profiles_2.Friend.deleteMany({}); // Delete any existing friend
        let res = await authRequestApp.put(`${baseUrl}/friends/requests`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "No pending friend request exist between you and that user",
            code: handlers_1.ErrorCode.NON_EXISTENT
        });
        // Check for a successful acceptance of friend request
        await (0, utils_1.testFriend)(user2, user, profiles_2.FRIEND_REQUEST_STATUS_CHOICES.PENDING);
        res = await authRequestApp.put(`${baseUrl}/friends/requests`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Friend Request Accepted" });
    });
    it('Should return user notifications', async () => {
        // Check for a successful return of notifications
        const res = await authRequestApp.get(`${baseUrl}/notifications`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Notifications fetched",
            data: (0, utils_1.paginatedTestData)("notifications", (0, utils_2.convertSchemaData)(profiles_1.NotificationSchema, [notification]))
        });
    });
    it('Should mark all notifications as read', async () => {
        // Check for a successful reading of all notifications
        const res = await authRequestApp.post(`${baseUrl}/notifications`).send({ markAllAsRead: true });
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Notifications read" });
    });
});
//# sourceMappingURL=profiles.test.js.map