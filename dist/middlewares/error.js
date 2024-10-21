"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.validationMiddleware = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const handlers_1 = require("../config/handlers");
const utils_1 = require("../config/utils");
const validationMiddleware = (type) => async (req, res, next) => {
    const instance = (0, class_transformer_1.plainToInstance)(type, req.body);
    const errors = await (0, class_validator_1.validate)(instance);
    if (errors.length > 0) {
        const formattedErrors = errors.reduce((acc, error) => {
            if (error.constraints) {
                // Get the first constraint message
                const [firstConstraint] = Object.values(error.constraints);
                acc[error.property] = firstConstraint;
            }
            return acc;
        }, {});
        const errResp = utils_1.CustomResponse.error("Invalid Entry", handlers_1.ErrorCode.INVALID_ENTRY, formattedErrors);
        res.status(422).json(errResp);
        return;
    }
    next();
};
exports.validationMiddleware = validationMiddleware;
/**
 * Centralized error handling middleware
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
const handleError = (err, req, res, next) => {
    const status = err.status || 500;
    const code = err.code || handlers_1.ErrorCode.SERVER_ERROR;
    const message = err.message || 'Something went wrong';
    const data = err.data || null;
    // Format the error response
    const errorResponse = {
        status: 'failure',
        message: message,
        code: code,
        ...(data && { data: data }) // Conditionally include `data` if it exists
    };
    res.status(status).json(errorResponse);
};
exports.handleError = handleError;
//# sourceMappingURL=error.js.map