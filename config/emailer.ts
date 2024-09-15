import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import ENV from '../config/config'
import { IUser } from '../models/accounts';
import { createOtp } from "../managers/users"

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENV.EMAIL_HOST_USER,
        pass: ENV.EMAIL_HOST_PASSWORD,
    },
});

const readTemplate = (filePath: string, replacements: Record<string, string>): string => {
    const templatePath = path.resolve(__dirname, "..", 'templates', filePath);
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return htmlContent;
};

const getEmailDetails = async (type: string, user: IUser): Promise<{ templatePath: string; subject: string; context: Record<string, string> }> => {
    let templatePath = 'welcome.html';
    let subject = 'Welcome!';
    let context: Record<string,any> = { name: user.firstName };
    let otp = await createOtp(user);

    switch (type) {
        case 'activate':
            templatePath = 'email-activation.html';
            subject = 'Activate your account';
            // Simulate OTP generation
            context.otp = otp; // Replace with actual OTP logic
            break;
        case 'reset':
            templatePath = 'password-reset.html';
            subject = 'Reset your password';
            // Simulate OTP generation
            context.otp = otp; // Replace with actual OTP logic
            break;
        case 'reset-success':
            templatePath = 'password-reset-success.html';
            subject = 'Password reset successfully';
            break;
        default:
            break;
    }

    return { templatePath, subject, context };
};

/**
 * Sends an email based on the provided type and user data.
 * @param {string} type - Type of the email to send. Can be 'activate', 'reset', etc.
 * @param {User} user - User object containing email and other user details.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 * @throws {Error} - Throws an error if sending the email fails.
 */
export const sendEmail = async (type: string, user: any): Promise<void> => {
    const { templatePath, subject, context } = await getEmailDetails(type, user);

    const htmlContent = readTemplate(templatePath, context);

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};