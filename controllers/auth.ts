import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../config/utils";
import { User } from "../models/accounts";
import { ValidationErr, validationMiddleware } from "../config/handlers";
import { createUser } from "../managers/users";
import { EmailSchema } from "../schemas/base";
import { RegisterSchema } from "../schemas/auth";
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
        const userData: RegisterSchema = req.body; // Type-check req.body

        const { email } = userData;
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new ValidationErr("email", "Email already registered")
        const user = await createUser(req.body)
    
        // Send email in background. Using a tool like bull queue will be better for intensive cases
        process.nextTick(async () => {
            try {
                await sendEmail("activate", user);
            } catch (error) {
                console.error('Error sending email in background:', error);
            }
        });    
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

export default authRouter;
