import express from 'express';
import swaggerUi from 'swagger-ui-express';
import env from './config/config';
import connectDB from './config/db';
import generalRouter from './controllers/general';
import authRouter from './controllers/auth';
import { handleError } from './middlewares/error';
import { SWAGGER_PATHS } from './docs/paths';
import feedRouter from './controllers/feed';
import profilesRouter from './controllers/profiles';
import chatsRouter from './controllers/chats';
import { authMiddleware } from './middlewares/auth';
import expressWs from 'express-ws';
import chatSocket from './sockets/chat';
import { authWsMiddleware } from './sockets/auth';
import notificationSocket from './sockets/notification';
import cors, { CorsOptions } from 'cors';
import http from 'http';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: env.SITE_NAME,
    version: '7.0.0',
    description: `
      A Social Networking API built with Node Express Typescript

      WEBSOCKETS:
          Notifications: 
              URL: wss://{host}/api/v7/ws/notifications
              * Requires authorization, so pass in the Bearer Authorization header.
              * You can only read and not send notification messages into this socket.
          Chats:
              URL: wss://{host}/api/v7/ws/chats/{id}
              * Requires authorization, so pass in the Bearer Authorization header.
              * Use chatId as the ID for existing chat or username if its the first message in a DM.
              * You cannot read realtime messages from a username that doesn't belong to the authorized user, but you can surely send messages
              * Only send message to the socket endpoint after the message has been created or updated, and files has been uploaded.
              * Fields when sending message through the socket: e.g {"status": "CREATED", "id": "507f1f77bcf86cd799439011"}
                  * status - This must be either CREATED or UPDATED (string type)
                  * id - This is the ID of the message (string type)
    `
  },
  servers: [{ url: '/api/v7' }],
  paths: SWAGGER_PATHS,
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    security: [
      {
        BearerAuth: [],
      },
   ],
  },
};

// CORS options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
      // If no origin (like in some requests from Postman) or if the origin is in the allowed list
      if (!origin || env.CORS_ALLOWED_ORIGINS.indexOf(origin) !== -1) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],  // Allowed HTTP methods
  allowedHeaders: ['origin', 'content-type', 'accept', 'authorization', 'x-request-id'],  // Allowed headers
  credentials: true,  // Enable CORS for credentials (cookies, auth headers)
};

const app: any = express();
expressWs(app)
const server = http.createServer(app);
app.use(express.json());
app.use(cors(corsOptions));

if (env.NODE_ENV !== 'test') {
  // Connect DB
  connectDB()
}

// Register Routes
app.use("/api/v7/general", generalRouter)
app.use("/api/v7/auth", authRouter)
app.use("/api/v7/feed", feedRouter)
app.use("/api/v7/profiles", profilesRouter)
app.use("/api/v7/chats", authMiddleware, chatsRouter)
app.ws("/api/v7/ws/chats/:id", authWsMiddleware, chatSocket)
app.ws("/api/v7/ws/notifications", authWsMiddleware, notificationSocket)

app.use(handleError)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (env.NODE_ENV !== 'test') {
  if (!server.listening) {
    server.listen(env.PORT, () => {
      console.log(`${env.SITE_NAME} server is running on port ${env.PORT}`);
      console.log(`Connected to MongoDB at ${env.MONGO_URI}`);
    });
  }
}
export default app