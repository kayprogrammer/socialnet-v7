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
const accounts_1 = require("../models/accounts");
const handlers_1 = require("../config/handlers");
const users_1 = require("../managers/users");
describe('AuthRoutes', () => {
    let mongoServer;
    let baseUrl = `${utils_1.BASE_URL}/auth`;
    let user;
    let requestApp = (0, supertest_1.default)(__1.default);
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        user = await (0, utils_1.testUser)();
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
    });
    it('Should create new user', async () => {
        const dataToSend = {
            firstName: "Test", lastName: "RegisterUser", email: "testregisteruser@example.com",
            password: "testregisteruser", termsAgreement: true
        };
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
            code: handlers_1.ErrorCode.INVALID_ENTRY,
            data: { email: "Email already registered" }
        });
    });
    it("Should verify user's email", async () => {
        const dataToSend = { email: "invalid@example.com", otp: 111111 };
        // Verify that error is returned for incorrect email
        let res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Incorrect email!",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Verify that error is returned for incorrect otp
        dataToSend.email = user.email;
        res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Otp is invalid or expired",
            code: handlers_1.ErrorCode.INVALID_OTP,
        });
        // Test for successful verification
        const otp = await (0, users_1.createOtp)(user);
        dataToSend.otp = otp;
        res = await requestApp.post(`${baseUrl}/verify-email`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Verification successful",
            data: { email: user.email }
        });
    });
    it("Should resend verification email", async () => {
        const dataToSend = { email: "invalid@example.com" };
        // Verify that error is returned for incorrect email
        let res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Incorrect email!",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Verify that email is already verified
        dataToSend.email = user.email;
        res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Email already verified" });
        // Test for successful email resend
        await accounts_1.User.updateOne({ _id: user._id }, { isEmailVerified: false });
        res = await requestApp.post(`${baseUrl}/resend-verification-email`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Email sent successful" });
    });
    it("Should send password reset email", async () => {
        const dataToSend = { email: "invalid@example.com" };
        // Verify that error is returned for incorrect email
        let res = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Incorrect email!",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Test for successful email resend
        dataToSend.email = user.email;
        res = await requestApp.post(`${baseUrl}/send-password-reset-otp`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Email sent successful" });
    });
    it("Should set new password", async () => {
        const dataToSend = { email: "invalid@example.com", otp: 111111, password: "newtestpassword" };
        // Verify that error is returned for incorrect email
        let res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
        expect(res.statusCode).toBe(404);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Incorrect email!",
            code: handlers_1.ErrorCode.NON_EXISTENT,
        });
        // Verify that error is returned for incorrect otp
        dataToSend.email = user.email;
        res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
        expect(res.statusCode).toBe(400);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Otp is invalid or expired",
            code: handlers_1.ErrorCode.INVALID_OTP,
        });
        // Test for successful verification
        const otp = await (0, users_1.createOtp)(user);
        dataToSend.otp = otp;
        res = await requestApp.post(`${baseUrl}/set-new-password`).send(dataToSend);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Password reset successful" });
    });
    it("Should create new tokens for authentication", async () => {
        const dataToSend = { email: "invalid@example.com", password: "newtestpassword" };
        // Verify that error is returned for invalid credentials
        let res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
        expect(res.statusCode).toBe(401);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Invalid credentials!",
            code: handlers_1.ErrorCode.INVALID_CREDENTIALS,
        });
        // Verify that error is returned for unverified user
        dataToSend.email = user.email;
        res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
        expect(res.statusCode).toBe(401);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Verify your email first",
            code: handlers_1.ErrorCode.UNVERIFIED_USER,
        });
        // Test for successful login
        await accounts_1.User.updateOne({ _id: user._id }, { isEmailVerified: true });
        res = await requestApp.post(`${baseUrl}/login`).send(dataToSend);
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Login successful",
            data: { access: expect.any(String), refresh: expect.any(String) }
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
            code: handlers_1.ErrorCode.INVALID_TOKEN,
        });
        // Test for successful refresh
        const tokens = await (0, utils_1.testTokens)(user);
        res = await requestApp.post(`${baseUrl}/refresh`).send({ refresh: tokens.refresh });
        expect(res.statusCode).toBe(201);
        respBody = res.body;
        expect(respBody).toMatchObject({
            status: "success",
            message: "Tokens refresh successful",
            data: { access: expect.any(String), refresh: expect.any(String) }
        });
    });
    it("Should logout the user", async () => {
        // Verify that error is returned for invalid token
        let res = await requestApp.get(`${baseUrl}/logout`).set('Authorization', `Bearer invalid_token`);
        ;
        expect(res.statusCode).toBe(401);
        let respBody = res.body;
        expect(respBody).toMatchObject({
            status: "failure",
            message: "Access token is invalid or expired",
            code: handlers_1.ErrorCode.INVALID_TOKEN,
        });
        // Test for successful refresh
        const tokens = await (0, utils_1.testTokens)(user);
        res = await requestApp.get(`${baseUrl}/logout`).set('Authorization', `Bearer ${tokens.access}`);
        expect(res.statusCode).toBe(200);
        respBody = res.body;
        expect(respBody).toMatchObject({ status: "success", message: "Logout successful" });
    });
});
//# sourceMappingURL=auth.test.js.map