"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutDocs = exports.refreshTokenDocs = exports.loginDocs = exports.passwordResetDocs = exports.passwordResetRequestEmailDocs = exports.resendVerificationEmailDocs = exports.verifyEmailDocs = exports.registerDocs = void 0;
const handlers_1 = require("../config/handlers");
const auth_1 = require("../schemas/auth");
const base_1 = require("../schemas/base");
const base_2 = require("./base");
const utils_1 = require("./utils");
const tags = ['Auth (8)'];
const registerDocs = {
    post: {
        tags: tags,
        summary: 'Register user',
        description: `This endpoint registers new users into our application.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Register", auth_1.RegisterSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Successful response', base_2.SUCCESS_STATUS, "Registration successful", base_1.EmailSchema),
            422: base_2.ERROR_EXAMPLE_422,
            500: base_2.ERROR_EXAMPLE_500
        },
    }
};
exports.registerDocs = registerDocs;
const INCORRECT_EMAIL_EXAMPLE = (0, utils_1.generateSwaggerResponseExample)('Incorrect Email', base_2.FAILURE_STATUS, "Incorrect Email", null, handlers_1.ErrorCode.INCORRECT_EMAIL);
const verifyEmailDocs = {
    post: {
        tags: tags,
        summary: 'Verify user email',
        description: `This endpoint verifies a user's email.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Email", auth_1.VerifyEmailSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Successful response', base_2.SUCCESS_STATUS, "Verification successful", base_1.EmailSchema),
            422: base_2.ERROR_EXAMPLE_422,
            404: INCORRECT_EMAIL_EXAMPLE,
            400: (0, utils_1.generateSwaggerResponseExample)('Invalid/Expired OTP', base_2.FAILURE_STATUS, "OTP is Invalid or Expired", null, handlers_1.ErrorCode.INVALID_OTP),
            500: base_2.ERROR_EXAMPLE_500
        },
    }
};
exports.verifyEmailDocs = verifyEmailDocs;
const resendVerificationEmailDocs = {
    post: {
        tags: tags,
        summary: 'Resend Verification email',
        description: `This endpoint resends verification email.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Email", base_1.EmailSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Successful response', base_2.SUCCESS_STATUS, "Email sent successful"),
            422: base_2.ERROR_EXAMPLE_422,
            404: INCORRECT_EMAIL_EXAMPLE,
            500: base_2.ERROR_EXAMPLE_500
        },
    }
};
exports.resendVerificationEmailDocs = resendVerificationEmailDocs;
const passwordResetRequestEmailDocs = {
    post: {
        tags: tags,
        summary: 'Password reset request',
        description: `This endpoint sends new password reset otp to the user's email.`,
        requestBody: resendVerificationEmailDocs.post.requestBody,
        responses: resendVerificationEmailDocs.post.responses,
    }
};
exports.passwordResetRequestEmailDocs = passwordResetRequestEmailDocs;
const passwordResetDocs = {
    post: {
        tags: tags,
        summary: 'Set New Password',
        description: `Verifies the password reset otp and updates the user's password.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Set Password", auth_1.SetNewPasswordSchema),
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Successful response', base_2.SUCCESS_STATUS, "Password reset successful"),
            422: base_2.ERROR_EXAMPLE_422,
            404: INCORRECT_EMAIL_EXAMPLE,
            400: (0, utils_1.generateSwaggerResponseExample)('Invalid/Expired OTP', base_2.FAILURE_STATUS, "OTP is Invalid or Expired", null, handlers_1.ErrorCode.INVALID_OTP),
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.passwordResetDocs = passwordResetDocs;
const LOGIN_401 = (0, utils_1.generateSwaggerResponseExample)('Invalid credentials', base_2.FAILURE_STATUS, "Invalid credentials!", null, handlers_1.ErrorCode.INVALID_CREDENTIALS);
LOGIN_401.content["application/json"].examples.example2 = (0, utils_1.generateSwaggerExampleValue)("Unverified User", base_2.FAILURE_STATUS, "Unverified User", null, handlers_1.ErrorCode.UNVERIFIED_USER);
const loginDocs = {
    post: {
        tags: tags,
        summary: 'Login A User',
        description: `Generates access and refresh tokens for the user based on login credentials.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Login", auth_1.LoginSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Login Successful response', base_2.SUCCESS_STATUS, "Login successful"),
            422: base_2.ERROR_EXAMPLE_422,
            401: LOGIN_401,
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.loginDocs = loginDocs;
const refreshTokenDocs = {
    post: {
        tags: tags,
        summary: 'Refresh Auth Tokens',
        description: `Generates new access and refresh tokens for the user based on refresh token.`,
        requestBody: (0, utils_1.generateSwaggerRequestExample)("Refresh token", auth_1.RefreshTokenSchema),
        responses: {
            201: (0, utils_1.generateSwaggerResponseExample)('Tokens refresh successful response', base_2.SUCCESS_STATUS, "Tokens refresh successful"),
            422: base_2.ERROR_EXAMPLE_422,
            401: (0, utils_1.generateSwaggerResponseExample)('Invalid refresh token', base_2.FAILURE_STATUS, "Refresh token is invalid or expired!", null, handlers_1.ErrorCode.INVALID_TOKEN),
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.refreshTokenDocs = refreshTokenDocs;
const logoutDocs = {
    get: {
        tags: tags,
        summary: 'Logout user',
        description: `Logout users by invalidating the current access and refresh tokens`,
        security: [{ BearerAuth: [] }], // Require BearerAuth for this endpoint
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Logout successful response', base_2.SUCCESS_STATUS, "Logout Successful"),
            401: base_2.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: base_2.ERROR_EXAMPLE_500
        }
    }
};
exports.logoutDocs = logoutDocs;
//# sourceMappingURL=auth.js.map