import { ErrorCode } from "../config/handlers";
import { RegisterSchema, SetNewPasswordSchema, VerifyEmailSchema } from "../schemas/auth";
import { EmailSchema } from "../schemas/base";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ['Auth']

const registerDocs = {
    post: {
        tags: tags,
        summary: 'Register user',
        description: "This endpoint registers new users into our application.",
        requestBody: generateSwaggerRequestExample("Register", RegisterSchema),
        responses: {
            201: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Registration successful", EmailSchema),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        },
    }
};

const INCORRECT_EMAIL_EXAMPLE = generateSwaggerResponseExample('Incorrect Email', FAILURE_STATUS, "Incorrect Email", null, ErrorCode.INCORRECT_EMAIL)

const verifyEmailDocs = {
    post: {
        tags: tags,
        summary: 'Verify user email',
        description: "This endpoint verifies a user's email.",
        requestBody: generateSwaggerRequestExample("Email", VerifyEmailSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Verification successful", EmailSchema),
            422: ERROR_EXAMPLE_422,
            404: INCORRECT_EMAIL_EXAMPLE,
            400: generateSwaggerResponseExample('Invalid/Expired OTP', FAILURE_STATUS, "OTP is Invalid or Expired", null, ErrorCode.INVALID_OTP),
            500: ERROR_EXAMPLE_500
        },
    }
};

const resendVerificationEmailDocs = {
    post: {
        tags: tags,
        summary: 'Resend Verification email',
        description: "This endpoint resends verification email.",
        requestBody: generateSwaggerRequestExample("Email", EmailSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Email sent successful"),
            422: ERROR_EXAMPLE_422,
            404:INCORRECT_EMAIL_EXAMPLE,
            500: ERROR_EXAMPLE_500
        },
    }
};

const passwordResetRequestEmailDocs = {
    post: {
        tags: tags,
        summary: 'Password reset request',
        description: "This endpoint sends new password reset otp to the user's email.",
        requestBody: resendVerificationEmailDocs.post.requestBody,
        responses: resendVerificationEmailDocs.post.responses,
    }
};

const passwordResetDocs = {
    post: {
        tags: tags,
        summary: 'Set New Password',
        description: "Verifies the password reset otp and updates the user's password.",
        requestBody: generateSwaggerRequestExample("Set Password", SetNewPasswordSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Password reset successful"),
            422: ERROR_EXAMPLE_422,
            404:INCORRECT_EMAIL_EXAMPLE,
            400: generateSwaggerResponseExample('Invalid/Expired OTP', FAILURE_STATUS, "OTP is Invalid or Expired", null, ErrorCode.INVALID_OTP),
            500: ERROR_EXAMPLE_500
        }
    }
};

export { registerDocs, verifyEmailDocs, resendVerificationEmailDocs, passwordResetRequestEmailDocs, passwordResetDocs }