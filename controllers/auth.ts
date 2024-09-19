import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../config/utils";
import { User } from "../models/accounts";
import { ErrorCode, NotFoundError, RequestError, ValidationErr, validationMiddleware } from "../config/handlers";
import { createOtp, createUser } from "../managers/users";
import { EmailSchema } from "../schemas/base";
import { RegisterSchema, VerifyEmailSchema } from "../schemas/auth";
import { sendEmail } from "../config/emailer"

const authRouter = Router();

/**
 * @route POST /register
 * @description Registers a new user and sends a confirmation email.
 * @param {Request} req - Express request object containing user registration data.
 * @param {Response} res - Express response object to send the registration success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with registration success message and user data.
 */
authRouter.post('/register', validationMiddleware(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: RegisterSchema = req.body;

        const { email } = userData;
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new ValidationErr("email", "Email already registered")
        const user = await createUser(req.body)
    
        // Send verification email
        await sendEmail("activate", user);
        return res.status(201).json(
            CustomResponse.success(
                'Registration successful', 
                user, 
                EmailSchema
            )    
        )
    } catch (error) {
        next(error)
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
authRouter.post('/verify-email', validationMiddleware(VerifyEmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: VerifyEmailSchema = req.body;

        const { email, otp } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")

        if (user.isEmailVerified) return res.status(200).json(CustomResponse.success("Email already verified"))
    
        // Verify otp
        let currentDate = new Date() 
        if (user.otp !== otp || currentDate > user.otpExpiry) throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        
        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { otp: null, otpExpiry: null, isEmailVerified: true } }
        );
        // Send welcome email
        await sendEmail("welcome", user);
        return res.status(200).json(
            CustomResponse.success(
                'Verification successful', 
                user, 
                EmailSchema
            )    
        )
    } catch (error) {
        next(error)
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
authRouter.post('/resend-verification-email', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: EmailSchema = req.body;

        const { email } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")

        if (user.isEmailVerified) return res.status(200).json(CustomResponse.success("Email already verified"))

        // Send otp email
        await sendEmail("activate", user);
        return res.status(200).json(CustomResponse.success('Email sent successful'))
    } catch (error) {
        next(error)
    }
});


export default authRouter;
