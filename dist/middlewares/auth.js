"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOrGuestMiddleware = exports.authMiddleware = void 0;
const handlers_1 = require("../config/handlers");
const users_1 = require("../managers/users");
const getUser = async (token) => {
    // Extract the token from Authorization header
    const user = await (0, users_1.decodeAuth)(token);
    if (!user)
        throw new handlers_1.RequestError("Access token is invalid or expired", 401, handlers_1.ErrorCode.INVALID_TOKEN);
    return user;
};
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Check if Authorization header exists
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))
            throw new handlers_1.RequestError("Unauthorized User", 401, handlers_1.ErrorCode.UNAUTHORIZED_USER);
        req.user = await getUser(req.headers.authorization.replace('Bearer ', ''));
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
const authOrGuestMiddleware = async (req, res, next) => {
    try {
        req.user_ = null;
        // Check if Authorization header exists
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            let user = await getUser(req.headers.authorization.replace('Bearer ', ''));
            req.user = user;
            req.user_ = user;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authOrGuestMiddleware = authOrGuestMiddleware;
//# sourceMappingURL=auth.js.map