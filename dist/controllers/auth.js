"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../config/utils");
const accounts_1 = require("../models/accounts");
const handlers_1 = require("../config/handlers");
const error_1 = require("../middlewares/error");
const users_1 = require("../managers/users");
const base_1 = require("../schemas/base");
const auth_1 = require("../schemas/auth");
const emailer_1 = require("../config/emailer");
const auth_2 = require("../middlewares/auth");
const authRouter = (0, express_1.Router)();
/**
 * @route POST /register
 * @description Registers a new user and sends a confirmation email.
 * @param {Request} req - Express request object containing user registration data.
 * @param {Response} res - Express response object to send the registration success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with registration success message and user data.
 */
authRouter.post('/register', (0, error_1.validationMiddleware)(auth_1.RegisterSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email } = userData;
        const existingUser = await accounts_1.User.findOne({ email });
        if (existingUser)
            throw new handlers_1.ValidationErr("email", "Email already registered");
        const user = await (0, users_1.createUser)(req.body);
        // Send verification email
        await (0, emailer_1.sendEmail)("activate", user);
        return res.status(201).json(utils_1.CustomResponse.success('Registration successful', user, base_1.EmailSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /verify-email
 * @description Verify a user's email and sends a welcome email.
 * @param {Request} req - Express request object containing verification email data.
 * @param {Response} res - Express response object to send the verification success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/verify-email', (0, error_1.validationMiddleware)(auth_1.VerifyEmailSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email, otp } = userData;
        const user = await accounts_1.User.findOne({ email });
        if (!user)
            throw new handlers_1.NotFoundError("Incorrect email!");
        if (user.isEmailVerified)
            return res.status(200).json(utils_1.CustomResponse.success("Email already verified"));
        // Verify otp
        const currentDate = new Date();
        if (user.otp !== otp || currentDate > user.otpExpiry)
            throw new handlers_1.RequestError("Otp is invalid or expired", 400, handlers_1.ErrorCode.INVALID_OTP);
        // Update user
        await accounts_1.User.updateOne({ _id: user._id }, { $set: { otp: null, otpExpiry: null, isEmailVerified: true } });
        // Send welcome email
        await (0, emailer_1.sendEmail)("welcome", user);
        return res.status(200).json(utils_1.CustomResponse.success('Verification successful', user, base_1.EmailSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /resend-verification-email
 * @description Resend a verification email to a user.
 * @param {Request} req - Express request object containing verification email data.
 * @param {Response} res - Express response object to send the email sent success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with success message
 */
authRouter.post('/resend-verification-email', (0, error_1.validationMiddleware)(base_1.EmailSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email } = userData;
        const user = await accounts_1.User.findOne({ email });
        if (!user)
            throw new handlers_1.NotFoundError("Incorrect email!");
        if (user.isEmailVerified)
            return res.status(200).json(utils_1.CustomResponse.success("Email already verified"));
        // Send otp email
        await (0, emailer_1.sendEmail)("activate", user);
        return res.status(200).json(utils_1.CustomResponse.success('Email sent successful'));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /send-password-reset-otp
 * @description This endpoint sends new password reset otp to the user's email.
 * We can use the verification email resend to do this actually, but I just wanted
 * to seperate it incase you have some special stuffs you might want to include here
 */
authRouter.post('/send-password-reset-otp', (0, error_1.validationMiddleware)(base_1.EmailSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email } = userData;
        const user = await accounts_1.User.findOne({ email });
        if (!user)
            throw new handlers_1.NotFoundError("Incorrect email!");
        // Send otp email
        await (0, emailer_1.sendEmail)("reset", user);
        return res.status(200).json(utils_1.CustomResponse.success('Email sent successful'));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /set-new-password
 * @description Verifies the password reset otp and updates the user's password.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/set-new-password', (0, error_1.validationMiddleware)(auth_1.SetNewPasswordSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email, otp, password } = userData;
        const user = await accounts_1.User.findOne({ email });
        if (!user)
            throw new handlers_1.NotFoundError("Incorrect email!");
        // Verify otp
        let currentDate = new Date();
        if (user.otp !== otp || currentDate > user.otpExpiry)
            throw new handlers_1.RequestError("Otp is invalid or expired", 400, handlers_1.ErrorCode.INVALID_OTP);
        // Update user
        await accounts_1.User.updateOne({ _id: user._id }, { $set: { otp: null, otpExpiry: null, password: await (0, users_1.hashPassword)(password) } });
        // Send password reset success email
        await (0, emailer_1.sendEmail)("reset-success", user);
        return res.status(200).json(utils_1.CustomResponse.success('Password reset successful'));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /login
 * @description Generates access and refresh tokens for the user based on login credentials.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/login', (0, error_1.validationMiddleware)(auth_1.LoginSchema), async (req, res, next) => {
    try {
        const userData = req.body;
        const { email, password } = userData;
        const user = await accounts_1.User.findOne({ email });
        if (!user || !(await (0, users_1.checkPassword)(user, password)))
            throw new handlers_1.RequestError("Invalid credentials!", 401, handlers_1.ErrorCode.INVALID_CREDENTIALS);
        if (!user.isEmailVerified)
            throw new handlers_1.RequestError("Verify your email first", 401, handlers_1.ErrorCode.UNVERIFIED_USER);
        // Generate tokens
        const access = (0, users_1.createAccessToken)(user.id);
        const refresh = (0, users_1.createRefreshToken)();
        // Update user with access tokens
        let tokens = { access, refresh };
        await accounts_1.User.updateOne({ _id: user._id }, { $push: { tokens } });
        return res.status(201).json(utils_1.CustomResponse.success('Login successful', tokens, auth_1.TokensSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /refresh
 * @description Generates new access and refresh tokens for the user based on refresh token.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/refresh', (0, error_1.validationMiddleware)(auth_1.RefreshTokenSchema), async (req, res, next) => {
    try {
        const refreshToken = req.body.refresh;
        const user = await accounts_1.User.findOne({ "tokens.refresh": refreshToken });
        if (!user || !(await (0, users_1.verifyRefreshToken)(refreshToken)))
            throw new handlers_1.RequestError("Refresh token is invalid or expired!", 401, handlers_1.ErrorCode.INVALID_TOKEN);
        // Generate new tokens
        const access = (0, users_1.createAccessToken)(user.id);
        const refresh = (0, users_1.createRefreshToken)();
        // Update user with access tokens
        const tokens = { access, refresh };
        await accounts_1.User.updateOne({ _id: user._id, "tokens.refresh": refreshToken }, { $set: { "tokens.$": tokens } });
        return res.status(201).json(utils_1.CustomResponse.success('Tokens refresh successful', tokens, auth_1.TokensSchema));
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /logout
 * @description Logout users by invalidating the current access and refresh tokens
 * @returns {Response} - JSON response with success message.
 */
authRouter.get('/logout', auth_2.authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;
        const authorization = req.headers.authorization;
        const token = authorization.replace('Bearer ', '');
        await accounts_1.User.updateOne({ _id: user._id, "tokens.access": token }, { $pull: { tokens: { access: token } } });
        return res.status(200).json(utils_1.CustomResponse.success("Logout successful"));
    }
    catch (error) {
        next(error);
    }
});
exports.default = authRouter;
//# sourceMappingURL=auth.js.map