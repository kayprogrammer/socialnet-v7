import express, { Application } from 'express';
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
import chatSocketRouter from './sockets/chat';
import { authWsMiddleware } from './sockets/auth';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: env.SITE_NAME,
    version: '7.0.0',
    description: `
      A Social Networking API built with Node Express Typescript

      WEBSOCKETS:
          Notifications: 
              URL: wss://{host}/api/v7/ws/notifications/
              * Requires authorization, so pass in the Bearer Authorization header.
              * You can only read and not send notification messages into this socket.
          Chats:
              URL: wss://{host}/api/v7/ws/chats/{id}/
              * Requires authorization, so pass in the Bearer Authorization header.
              * Use chat_id as the ID for existing chat or username if its the first message in a DM.
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

const app: any = express();
expressWs(app)
app.use(express.json());

// Connect DB
connectDB()

// Register Routes
app.use("/api/v7/general", generalRouter)
app.use("/api/v7/auth", authRouter)
app.use("/api/v7/feed", feedRouter)
app.use("/api/v7/profiles", profilesRouter)
app.use("/api/v7/chats", authMiddleware, chatsRouter)
app.ws("/api/v7/ws/chat/:id", authWsMiddleware, chatSocketRouter)

app.use(handleError)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(env.PORT, () => {
  console.log(`${env.SITE_NAME} server is running on port ${env.PORT}`);
  console.log(`Connected to MongoDB at ${env.MONGO_URI}`);
});

