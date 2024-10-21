"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerErr = exports.NotFoundError = exports.UnauthorizedError = exports.ValidationErr = exports.RequestError = exports.ErrorCode = void 0;
class ErrorCode {
}
exports.ErrorCode = ErrorCode;
ErrorCode.UNAUTHORIZED_USER = "unauthorized_user";
ErrorCode.NETWORK_FAILURE = "network_failure";
ErrorCode.SERVER_ERROR = "server_error";
ErrorCode.INVALID_ENTRY = "invalid_entry";
ErrorCode.INCORRECT_EMAIL = "incorrect_email";
ErrorCode.INVALID_OTP = "invalid_otp";
ErrorCode.INVALID_AUTH = "invalid_auth";
ErrorCode.INVALID_TOKEN = "invalid_token";
ErrorCode.INVALID_CREDENTIALS = "invalid_credentials";
ErrorCode.UNVERIFIED_USER = "unverified_user";
ErrorCode.NON_EXISTENT = "non_existent";
ErrorCode.INVALID_OWNER = "invalid_owner";
ErrorCode.INVALID_PAGE = "invalid_page";
ErrorCode.INVALID_PARAM = "invalid_param";
ErrorCode.INVALID_MEMBER = "invalid_member";
ErrorCode.INVALID_VALUE = "invalid_value";
ErrorCode.NOT_ALLOWED = "not_allowed";
ErrorCode.INVALID_DATA_TYPE = "invalid_data_type";
class RequestError extends Error {
    constructor(message, status, code, data) {
        super(message);
        this.status = status;
        this.code = code;
        this.data = data;
        // Set the prototype explicitly to maintain instanceof behavior
        Object.setPrototypeOf(this, RequestError.prototype);
        // Capture the stack trace (if available)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.RequestError = RequestError;
class ValidationErr extends RequestError {
    constructor(field, field_message) {
        let message = "Invalid Entry";
        let data = { [field]: field_message };
        super(message, 422, ErrorCode.INVALID_ENTRY, data);
    }
}
exports.ValidationErr = ValidationErr;
// Other specific error classes can also use ErrorCode constants
class UnauthorizedError extends RequestError {
    constructor(message) {
        super(message, 401, ErrorCode.UNAUTHORIZED_USER);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends RequestError {
    constructor(message) {
        super(message, 404, ErrorCode.NON_EXISTENT);
    }
}
exports.NotFoundError = NotFoundError;
class ServerErr extends RequestError {
    constructor(message = "Server Error") {
        super(message, 500, ErrorCode.SERVER_ERROR);
    }
}
exports.ServerErr = ServerErr;
//# sourceMappingURL=handlers.js.map