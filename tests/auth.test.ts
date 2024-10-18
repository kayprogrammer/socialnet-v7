import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, testVerifiedUser } from "./utils";
import { IUser } from "../models/accounts";
import { ErrorCode } from "../config/handlers";

describe('AuthRoutes', () => {
  let mongoServer: MongoMemoryServer;
  let baseUrl: string = `${BASE_URL}/auth`
  let verifiedUser: IUser

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    verifiedUser = await testVerifiedUser()
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should create new user', async () => {
    const dataToSend = {
        firstName: "Test", lastName: "RegisterUser", email: "testregisteruser@example.com",
        password: "testregisteruser", termsAgreement: true
    }
    let res = await request(app).post(`${baseUrl}/register`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Registration successful",
      data: { email: dataToSend.email }
    });

    // Test for duplicate email error by repeating process
    res = await request(app).post(`${baseUrl}/register`).send(dataToSend);
    expect(res.statusCode).toBe(422);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Invalid Entry",
      code: ErrorCode.INVALID_ENTRY,
      data: { email: "Email already registered" }
    });
  });

  it("Should verify user's email", async () => {
    const dataToSend = {
        firstName: "Test", lastName: "RegisterUser", email: "testregisteruser@example.com",
        password: "testregisteruser", termsAgreement: true
    }
    let res = await request(app).post(`${baseUrl}/register`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Registration successful",
      data: { email: dataToSend.email }
    });

    // Test for duplicate email error by repeating process
    res = await request(app).post(`${baseUrl}/register`).send(dataToSend);
    expect(res.statusCode).toBe(422);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Invalid Entry",
      code: ErrorCode.INVALID_ENTRY,
      data: { email: "Email already registered" }
    });
  });
});