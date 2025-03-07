import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, testTokens, testUser } from "./utils";
import { IUser, User } from "../models/accounts";
import { ErrorCode } from "../config/handlers";
import { createOtp } from "../managers/users";
import TestAgent from "supertest/lib/agent";

describe('AuthRoutes', () => {
  let mongoServer: MongoMemoryServer;
  let baseUrl: string = `${BASE_URL}/auth`
  let user: IUser
  let requestApp: TestAgent = request(app)

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    user = await testUser()
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
    let res = await requestApp.post(`${baseUrl}/register`).send(dataToSend);
    expect(res.statusCode).toBe(201);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Registration successful",
      data: { email: dataToSend.email }
    });

    // Test for duplicate email error by repeating process
    res = await requestApp.post(`${baseUrl}/register`).send(dataToSend);
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
    const dataToSend = { email: "invalid@example.com", otp: 111111 }

    // Verify that error is returned for incorrect email
    let res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Incorrect email!",
      code: ErrorCode.NON_EXISTENT,
    });

    // Verify that error is returned for incorrect otp
    dataToSend.email = user.email
    res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Otp is invalid or expired",
      code: ErrorCode.INVALID_OTP,
    });

    // Test for successful verification
    const otp = await createOtp(user)
    dataToSend.otp = otp
    res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
    expect(res.statusCode).toBe(200)
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Verification successful",
      data: { email: user.email }
    });
  });

  it("Should resend verification email", async () => {
    const dataToSend = { email: "invalid@example.com" }

    // Verify that error is returned for incorrect email
    let res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Incorrect email!",
      code: ErrorCode.NON_EXISTENT,
    });

    // Verify that email is already verified
    dataToSend.email = user.email
    res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
    expect(res.statusCode).toBe(200);
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Email already verified" });

    // Test for successful email resend
    await User.updateOne({ _id: user._id }, { isEmailVerified: false })
    res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
    expect(res.statusCode).toBe(200)
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Email sent successful" });
  });

  it("Should send password reset email", async () => {
    const dataToSend = { email: "invalid@example.com" }

    // Verify that error is returned for incorrect email
    let res = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Incorrect email!",
      code: ErrorCode.NON_EXISTENT,
    });

    // Test for successful email resend
    dataToSend.email = user.email
    res = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send(dataToSend);
    expect(res.statusCode).toBe(200)
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Email sent successful" });
  });
  
  it("Should set new password", async () => {
    const dataToSend = { email: "invalid@example.com", otp: 111111, password: "newtestpassword" }

    // Verify that error is returned for incorrect email
    let res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
    expect(res.statusCode).toBe(404);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Incorrect email!",
      code: ErrorCode.NON_EXISTENT,
    });

    // Verify that error is returned for incorrect otp
    dataToSend.email = user.email
    res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
    expect(res.statusCode).toBe(400);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Otp is invalid or expired",
      code: ErrorCode.INVALID_OTP,
    });

    // Test for successful verification
    const otp = await createOtp(user)
    dataToSend.otp = otp
    res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
    expect(res.statusCode).toBe(200)
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Password reset successful" });
  });

  it("Should create new tokens for authentication", async () => {
    const dataToSend = { email: "invalid@example.com", password: "newtestpassword" }

    // Verify that error is returned for invalid credentials
    let res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
    expect(res.statusCode).toBe(401);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Invalid credentials!",
      code: ErrorCode.INVALID_CREDENTIALS,
    });

    // Verify that error is returned for unverified user
    dataToSend.email = user.email
    res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
    expect(res.statusCode).toBe(401);
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Verify your email first",
      code: ErrorCode.UNVERIFIED_USER,
    });

    // Test for successful login
    await User.updateOne({ _id: user._id }, { isEmailVerified: true })
    res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
    expect(res.statusCode).toBe(201)
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Login successful",
      data: { access: expect.any(String), refresh: expect.any(String), username: expect.any(String) }
    });
  });

  it("Should refresh the tokens for authentication", async () => {
    // Verify that error is returned for invalid token
    let res = await requestApp.post(`${baseUrl}/refresh`).send({ refresh: "invalidtoken" });
    expect(res.statusCode).toBe(401);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Refresh token is invalid or expired!",
      code: ErrorCode.INVALID_TOKEN,
    });

    // Test for successful refresh
    const tokens = await testTokens(user)
    res = await requestApp.post(`${baseUrl}/refresh`).send({ refresh: tokens.refresh });
    expect(res.statusCode).toBe(201)
    respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Tokens refresh successful",
      data: { access: expect.any(String), refresh: expect.any(String), username: expect.any(String) }
    });
  });

  it("Should logout the user", async () => {
    // Verify that error is returned for invalid token
    let res = await requestApp.get(`${baseUrl}/logout`).set('Authorization', `Bearer invalid_token`);;
    expect(res.statusCode).toBe(401);
    let respBody = res.body;
    expect(respBody).toMatchObject({
      status: "failure",
      message: "Access token is invalid or expired",
      code: ErrorCode.INVALID_TOKEN,
    });

    // Test for successful refresh
    const tokens = await testTokens(user)
    res = await requestApp.get(`${baseUrl}/logout`).set('Authorization', `Bearer ${tokens.access}`);
    expect(res.statusCode).toBe(200)
    respBody = res.body;
    expect(respBody).toMatchObject({ status: "success", message: "Logout successful" });
  });
});
