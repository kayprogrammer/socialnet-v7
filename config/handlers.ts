import { NextFunction, Request, Response } from "express";
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CustomResponse } from "./utils";

export class ErrorCode {
    static readonly UNAUTHORIZED_USER = "unauthorized_user";
    static readonly NETWORK_FAILURE = "network_failure";
    static readonly SERVER_ERROR = "server_error";
    static readonly INVALID_ENTRY = "invalid_entry";
    static readonly INCORRECT_EMAIL = "incorrect_email";
    static readonly INVALID_OTP = "invalid_otp";
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

        // Set the prototype explicitly to maintain instanceof behavior
        Object.setPrototypeOf(this, RequestError.prototype);

        // Capture the stack trace (if available)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class ValidationErr extends RequestError {
    constructor(field: string, field_message: string) {
        let message = "Invalid Entry"
        let data = {[field]: field_message}
        super(message, 422, ErrorCode.INVALID_ENTRY, data);
    }
}

// Other specific error classes can also use ErrorCode constants
export class UnauthorizedError extends RequestError {
    constructor(message: string) {
        super(message, 401, ErrorCode.UNAUTHORIZED_USER);
    }
}

export class NotFoundError extends RequestError {
    constructor(message: string) {
        super(message, 404, ErrorCode.NON_EXISTENT);
    }
}

export class ServerErr extends RequestError {
    constructor(message: string = "Server Error") {
        super(message, 500, ErrorCode.SERVER_ERROR);
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


// Constrain T to be an object
export const validationMiddleware = <T extends object>(type: ClassConstructor<T>) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const instance = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(instance);
        if (errors.length > 0) {
            const formattedErrors = errors.reduce((acc, error) => {
                if (error.constraints) {
                    // Get the first constraint message
                    const [firstConstraint] = Object.values(error.constraints);
                    acc[error.property] = firstConstraint;
                }
                return acc;
            }, {} as Record<string, string>);
            const errResp = CustomResponse.error("Invalid Entry", ErrorCode.INVALID_ENTRY, formattedErrors)
            res.status(422).json(errResp)
            return
        }
        next();
    };