"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authWsMiddleware = void 0;
const handlers_1 = require("../config/handlers");
const users_1 = require("../managers/users");
const base_1 = require("./base");
const config_1 = __importDefault(require("../config/config"));
const getUser = async (ws, token) => {
    // Extract the token from Authorization header
    const user = await (0, users_1.decodeAuth)(token);
    if (!user)
        (0, base_1.WSError)(ws, 4001, handlers_1.ErrorCode.INVALID_TOKEN, "Access token is invalid or expired");
    return user;
};
const authWsMiddleware = async (ws, req, next) => {
    let authorizationValue = req.headers.authorization;
    if (authorizationValue) {
        if (authorizationValue.startsWith("Bearer ")) {
            ws.user = await getUser(ws, authorizationValue.replace('Bearer ', ''));
            next();
        }
        else if (authorizationValue == config_1.default.SOCKET_SECRET) {
            ws.user = authorizationValue;
            next();
        }
        else {
            (0, base_1.WSError)(ws, 4001, handlers_1.ErrorCode.UNAUTHORIZED_USER, "Unauthorized User");
        }
    }
    else {
        (0, base_1.WSError)(ws, 4001, handlers_1.ErrorCode.UNAUTHORIZED_USER, "Unauthorized User");
    }
};
exports.authWsMiddleware = authWsMiddleware;
//# sourceMappingURL=auth.js.map