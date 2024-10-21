import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the schema for your environment variables
const envSchema = z.object({
  SITE_NAME: z.string(),
  SECRET_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  EMAIL_OTP_EXPIRE_SECONDS: z.string().transform(Number),
  ACCESS_TOKEN_EXPIRY: z.string().transform(Number),
  REFRESH_TOKEN_EXPIRY: z.string().transform(Number),
  FRONTEND_URL: z.string().url(),
  FIRST_SUPERUSER_EMAIL: z.string().email(),
  FIRST_SUPERUSER_PASSWORD: z.string(),
  FIRST_CLIENT_EMAIL: z.string().email(),
  FIRST_CLIENT_PASSWORD: z.string(),
  EMAIL_HOST_USER: z.string().email(),
  EMAIL_HOST_PASSWORD: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().regex(/^\d+$/).transform(Number),
  EMAIL_USE_SSL: z.string().transform((val) => val.toLowerCase() === 'true'),
  DEFAULT_FROM_EMAIL: z.string().email(),
  CORS_ALLOWED_ORIGINS: z.string().transform((origins) => origins.split(',')),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  PORT: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), {
    message: 'PORT must be a number',
  }),
  SOCKET_SECRET: z.string(),
  MONGO_URI: z.string().url(),
  SWAGGER_BASE_URL: z.string(),
});

// Validate and parse the environment variables
const ENV = envSchema.parse(process.env);

export default ENV;
