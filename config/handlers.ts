import { NextFunction, Request, Response } from "express";

export class ErrorCode {
    static readonly UNAUTHORIZED_USER = "unauthorized_user";
    static readonly NETWORK_FAILURE = "network_failure";
    static readonly SERVER_ERROR = "server_error";
    static readonly INVALID_ENTRY = "invalid_entry";
    static readonly INCORRECT_EMAIL = "incorrect_email";
    static readonly INCORRECT_OTP = "incorrect_otp";
    static readonly EXPIRED_OTP = "expired_otp";
    static readonly INVALID_AUTH = "invalid_auth";
    static readonly INVALID_TOKEN = "invalid_token";
    static readonly INVALID_CREDENTIALS = "invalid_credentials";
    static readonly UNVERIFIED_USER = "unverified_user";
    static readonly NON_EXISTENT = "non_existent";
    static readonly INVALID_OWNER = "invalid_owner";
    static readonly INVALID_PAGE = "invalid_page";
    static readonly INVALID_VALUE = "invalid_value";
    static readonly NOT_ALLOWED = "not_allowed";
    static readonly INVALID_DATA_TYPE = "invalid_data_type";
}

export class RequestError extends Error {
    status: number;
    code: string;
    data?: any;

    constructor(message: string, status: number, code: string, data?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

export class ValidationError extends RequestError {
    constructor(message: string, data?: any) {
        super(message, 422, ErrorCode.INVALID_ENTRY, data);
    }
}

// Other specific error classes can also use ErrorCode constants
export class UnauthorizedError extends RequestError {
    constructor(message: string) {
        super(message, 401, ErrorCode.UNAUTHORIZED_USER);
    }
}


/**
 * Centralized error handling middleware
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
export const handleError = (err: RequestError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const code = err.code || ErrorCode.SERVER_ERROR;
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