"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = __importDefault(require("./config/config"));
const db_1 = __importDefault(require("./config/db"));
const general_1 = __importDefault(require("./controllers/general"));
const auth_1 = __importDefault(require("./controllers/auth"));
const error_1 = require("./middlewares/error");
const paths_1 = require("./docs/paths");
const feed_1 = __importDefault(require("./controllers/feed"));
const profiles_1 = __importDefault(require("./controllers/profiles"));
const chats_1 = __importDefault(require("./controllers/chats"));
const auth_2 = require("./middlewares/auth");
const express_ws_1 = __importDefault(require("express-ws"));
const chat_1 = __importDefault(require("./sockets/chat"));
const auth_3 = require("./sockets/auth");
const notification_1 = __importDefault(require("./sockets/notification"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const config_2 = __importDefault(require("./config/config"));
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: config_1.default.SITE_NAME,
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
    paths: paths_1.SWAGGER_PATHS,
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
const corsOptions = {
    origin: (origin, callback) => {
        // If no origin (like in some requests from Postman) or if the origin is in the allowed list
        if (!origin || config_1.default.CORS_ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['origin', 'content-type', 'accept', 'authorization', 'x-request-id'], // Allowed headers
    credentials: true, // Enable CORS for credentials (cookies, auth headers)
};
const app = (0, express_1.default)();
(0, express_ws_1.default)(app);
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
if (config_1.default.NODE_ENV !== 'test') {
    // Connect DB
    (0, db_1.default)();
}
// Register Routes
app.use("/api/v7/general", general_1.default);
app.use("/api/v7/auth", auth_1.default);
app.use("/api/v7/feed", feed_1.default);
app.use("/api/v7/profiles", profiles_1.default);
app.use("/api/v7/chats", auth_2.authMiddleware, chats_1.default);
app.ws("/api/v7/ws/chats/:id", auth_3.authWsMiddleware, chat_1.default);
app.ws("/api/v7/ws/notifications", auth_3.authWsMiddleware, notification_1.default);
app.use(error_1.handleError);
app.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, { customCssUrl: config_2.default.SWAGGER_CSS }));
if (config_1.default.NODE_ENV !== 'test') {
    if (!server.listening) {
        server.listen(config_1.default.PORT, () => {
            console.log(`${config_1.default.SITE_NAME} server is running on port ${config_1.default.PORT}`);
            console.log(`Connected to MongoDB at ${config_1.default.MONGO_URI}`);
        });
    }
}
exports.default = app;
//# sourceMappingURL=index.js.map