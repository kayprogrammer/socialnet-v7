"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
// Define the schema for your environment variables
const envSchema = zod_1.z.object({
    SITE_NAME: zod_1.z.string(),
    SECRET_KEY: zod_1.z.string(),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']),
    EMAIL_OTP_EXPIRE_SECONDS: zod_1.z.string().transform(Number),
    ACCESS_TOKEN_EXPIRY: zod_1.z.string().transform(Number),
    REFRESH_TOKEN_EXPIRY: zod_1.z.string().transform(Number),
    FRONTEND_URL: zod_1.z.string().url(),
    FIRST_SUPERUSER_EMAIL: zod_1.z.string().email(),
    FIRST_SUPERUSER_PASSWORD: zod_1.z.string(),
    FIRST_CLIENT_EMAIL: zod_1.z.string().email(),
    FIRST_CLIENT_PASSWORD: zod_1.z.string(),
    EMAIL_HOST_USER: zod_1.z.string().email(),
    EMAIL_HOST_PASSWORD: zod_1.z.string(),
    EMAIL_HOST: zod_1.z.string(),
    EMAIL_PORT: zod_1.z.string().regex(/^\d+$/).transform(Number),
    EMAIL_USE_SSL: zod_1.z.string().transform((val) => val.toLowerCase() === 'true'),
    DEFAULT_FROM_EMAIL: zod_1.z.string().email(),
    CORS_ALLOWED_ORIGINS: zod_1.z.string().transform((origins) => origins.split(',')),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string(),
    CLOUDINARY_API_KEY: zod_1.z.string(),
    CLOUDINARY_API_SECRET: zod_1.z.string(),
    PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), {
        message: 'PORT must be a number',
    }),
    SOCKET_SECRET: zod_1.z.string(),
    MONGO_URI: zod_1.z.string().url(),
    SWAGGER_BASE_URL: zod_1.z.string(),
});
// Validate and parse the environment variables
const ENV = envSchema.parse(process.env);
exports.default = ENV;
//# sourceMappingURL=config.js.map