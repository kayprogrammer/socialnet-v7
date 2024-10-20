import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, paginatedTestData, testAnotherVerifiedUser, testCity, testFriend, testNotification, testTokens, testVerifiedUser } from "./utils";
import TestAgent from "supertest/lib/agent";
import app from "..";
import { ICity, IUser } from "../models/accounts";
import mongoose from "mongoose";
import { CitySchema, NotificationSchema, ProfileSchema } from "../schemas/profiles";
import { convertSchemaData } from "../config/utils";
import { ErrorCode } from "../config/handlers";
import { ID_EXAMPLE } from "../schemas/base";
import { Friend, FRIEND_REQUEST_STATUS_CHOICES, IFriend, INotification } from "../models/profiles";
import { createUser } from "../managers/users";

describe('ProfilesRoutes', () => {
  let mongoServer: MongoMemoryServer;
  const baseUrl: string = `${BASE_URL}/profiles`
  const requestApp: TestAgent = request(app)
  let authRequestApp: TestAgent
  let user: IUser
  let user2: IUser

  let city: ICity
  let notification: INotification
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    user = await testVerifiedUser()
    const tokens = await testTokens(user)
    authRequestApp = request.agent(app).set('Authorization', `Bearer ${tokens.access}`)

    // Another user
    user2 = await testAnotherVerifiedUser()

    city = await testCity()
    await testFriend(user2, user)
    notification = await testNotification(user2, user) 
  });

  afterAll(async () => {
    await mongoose.disconnect();
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
      data: paginatedTestData("users", convertSchemaData(ProfileSchema, [user, user2]))
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
      data: convertSchemaData(CitySchema, [city])
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
      code: ErrorCode.NON_EXISTENT,
    });

    // Check for a successful return of the user profile
    res = await requestApp.get(`${baseUrl}/profile/${user.username}`);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "User details fetched",
      data: convertSchemaData(ProfileSchema, user)
    });
  });

  it('Should update a user profile', async () => {
    const dataToSend = { firstName: "Name", lastName: "Updated", bio: "I'm the best", cityId: ID_EXAMPLE }
    // Check for an error returned due to invalid city ID
    let res = await authRequestApp.patch(`${baseUrl}/profile`).send(dataToSend);
    expect(res.statusCode).toBe(422);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Invalid Entry",
      code: ErrorCode.INVALID_ENTRY,
      data: { cityId: "No city with that ID" }
    });

    // Check for a successful update of the profile
    dataToSend.cityId = city.id.toString()
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
    const userToDeleteData = { firstName: "Test", lastName: "UserDel", email: "testdel@email.com", password: "testdel" }
    const userToDelete = await createUser(userToDeleteData, true)
    const tokens = await testTokens(userToDelete)
    const reqApp = request.agent(app).set('Authorization', `Bearer ${tokens.access}`)

    const dataToSend = { password: "invalid_password" }
    // Check for an error returned due to invalid password
    let res = await reqApp.post(`${baseUrl}/profile`).send(dataToSend);
    expect(res.statusCode).toBe(422);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Invalid Entry",
      code: ErrorCode.INVALID_ENTRY,
      data: { password: "Incorrect password" }
    });

    // Check for a successful deletion of the profile
    dataToSend.password = userToDeleteData.password
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
      data: paginatedTestData("users", convertSchemaData(ProfileSchema, [user2]))
    });
  });

  it('Should return friend requests', async () => {
    await testFriend(user2, user, FRIEND_REQUEST_STATUS_CHOICES.PENDING) // Set friendship to pending
    // Check for a successful return of friends
    const res = await authRequestApp.get(`${baseUrl}/friends/requests`);
    expect(res.statusCode).toBe(200);
    const respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Friends Requests fetched",
      data: paginatedTestData("users", convertSchemaData(ProfileSchema, [user2]))
    });
  });

  it('Should send friend requests', async () => {
    const dataToSend = { username: user2.username }
    // Return error if the user you are trying to be-friend has already sent a request 
    let res = await authRequestApp.post(`${baseUrl}/friends/requests`).send(dataToSend);
    expect(res.statusCode).toBe(403);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "This user already sent you a friend request",
      code: ErrorCode.NOT_ALLOWED
    });

    // Check for a successful sending of friend request
    await Friend.deleteMany({}) // Delete any existing friend
    res = await authRequestApp.post(`${baseUrl}/friends/requests`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Friend Request sent" });
  });

  it('Should accept friend request', async () => {
    const dataToSend = { username: user2.username, accepted: true }
    // Return error if no existing pending request btw you and user 
    await Friend.deleteMany({}) // Delete any existing friend
    let res = await authRequestApp.put(`${baseUrl}/friends/requests`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "No pending friend request exist between you and that user",
      code: ErrorCode.NON_EXISTENT
    });

    // Check for a successful acceptance of friend request
    await testFriend(user2, user, FRIEND_REQUEST_STATUS_CHOICES.PENDING)
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
      data: paginatedTestData("notifications", convertSchemaData(NotificationSchema, [notification]))
    });
  });

  it('Should mark all notifications as read', async () => {
    // Check for a successful reading of all notifications
    const res = await authRequestApp.post(`${baseUrl}/notifications`).send({ markAllAsRead: true });
    expect(res.statusCode).toBe(200);
    const respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Notifications read" });
  });
})
