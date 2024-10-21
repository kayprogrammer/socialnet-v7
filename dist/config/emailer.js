"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../config/config"));
const users_1 = require("../managers/users");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.default.EMAIL_HOST_USER,
        pass: config_1.default.EMAIL_HOST_PASSWORD,
    },
});
const readTemplate = (filePath, replacements) => {
    const templatePath = path_1.default.resolve(__dirname, "..", 'templates', filePath);
    let htmlContent = fs_1.default.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    }
    return htmlContent;
};
const getEmailDetails = async (type, user) => {
    let templatePath = 'welcome.html';
    let subject = 'Welcome!';
    let context = { name: user.firstName };
    let otp = await (0, users_1.createOtp)(user);
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
const sendEmail = async (type, user) => {
    if (config_1.default.NODE_ENV === "test")
        return;
    const { templatePath, subject, context } = await getEmailDetails(type, user);
    const htmlContent = readTemplate(templatePath, context);
    const mailOptions = {
        from: config_1.default.DEFAULT_FROM_EMAIL,
        to: user.email,
        subject,
        html: htmlContent,
    };
    // Send email in background. Using a tool like bull queue will be better for intensive cases
    process.nextTick(async () => {
        await transporter.sendMail(mailOptions)
            .catch(error => {
            console.error('Error sending email:', error.message);
        });
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailer.js.map