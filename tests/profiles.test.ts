import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, paginatedTestData, testAnotherVerifiedUser, testCity, testTokens, testVerifiedUser } from "./utils";
import TestAgent from "supertest/lib/agent";
import app from "..";
import { ICity, IUser } from "../models/accounts";
import mongoose from "mongoose";
import { CitySchema, ProfileSchema } from "../schemas/profiles";
import { convertSchemaData } from "../config/utils";
import { ErrorCode } from "../config/handlers";
import { ID_EXAMPLE } from "../schemas/base";

describe('ProfilesRoutes', () => {
    let mongoServer: MongoMemoryServer;
    const baseUrl: string = `${BASE_URL}/profiles`
    const requestApp: TestAgent = request(app)
    let authRequestApp: TestAgent
    let authRequestApp2: TestAgent
    let user: IUser
    let user2: IUser

    let city: ICity
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
    
        city = await testCity()
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
        const dataToSend = { password: "invalid_password" }
        // Check for an error returned due to invalid password
        let res = await authRequestApp.post(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(422);
        let respBody = res.body;
        expect(respBody).toMatchObject({
          status: "failure",
          message: "Invalid Entry",
          code: ErrorCode.INVALID_ENTRY,
          data: { password: "Incorrect password" }
        });
    
        // Check for a successful deletion of the profile
        dataToSend.password = "testuserverified"
        res = await authRequestApp.post(`${baseUrl}/profile`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Profile deleted" });
    });
})
