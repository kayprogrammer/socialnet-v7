import { ErrorCode } from "../config/handlers";
import { RegisterSchema, VerifyEmailSchema } from "../schemas/auth";
import { EmailSchema } from "../schemas/base";
import { SiteDetailSchema } from "../schemas/general";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateSwaggerExample } from "./utils"

const tags = ['Auth']

const registerDocs = {
    post: {
        tags: tags,
        summary: 'Register user',
        description: "This endpoint registers new users into our application.",
        requestBody: { 
            content: {
                'application/json': {
                    examples: {
                        example1: {
                            summary: "Register body example",
                            value: generateSwaggerExample(RegisterSchema)
                        }
                    }
                },
            },
            required: true
        },
        responses: {
            201: {
                description: 'Successful response',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'An example response',
                                value: {
                                    status: SUCCESS_STATUS,
                                    message: "Registration successful",
                                    data: {"email": "johndoe@example.com"}
                                },
                            },
                        },
                    },
                },
            },
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        },
    }
};

const verifyEmailDocs = {
    post: {
        tags: tags,
        summary: 'Verify user email',
        description: "This endpoint verifies a user's email.",
        requestBody: { 
            content: {
                'application/json': {
                    examples: {
                        example1: {
                            summary: "Email body example",
                            value: generateSwaggerExample(VerifyEmailSchema)
                        }
                    }
                },
            },
            required: true
        },
        responses: {
            200: {
                description: 'Successful response',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'Email verified',
                                value: {
                                    status: SUCCESS_STATUS,
                                    message: "Verification successful",
                                    data: {"email": "johndoe@example.com"}
                                },
                            },
                        },
                    },
                },
            },
            422: ERROR_EXAMPLE_422,
            404: {
                description: 'Incorrect Email',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'Incorrect Email',
                                value: {
                                    status: FAILURE_STATUS,
                                    code: ErrorCode.INCORRECT_EMAIL,
                                    message: "Incorrect Email",
                                },
                            },
                        },
                    },
                }
            },
            400: {
                description: 'Invalid/Expired OTP',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'Invalid/Expired OTP',
                                value: {
                                    status: FAILURE_STATUS,
                                    code: ErrorCode.INVALID_OTP,
                                    message: "OTP is Invalid/Expired",
                                },
                            },
                        },
                    },
                }
            },
            500: ERROR_EXAMPLE_500
        },
    }
};

const resendVerificationEmailDocs = {
    post: {
        tags: tags,
        summary: 'Resend Verification email',
        description: "This endpoint resends verification email.",
        requestBody: { 
            content: {
                'application/json': {
                    examples: {
                        example1: {
                            summary: "Email body example",
                            value: generateSwaggerExample(EmailSchema)
                        }
                    }
                },
            },
            required: true
        },
        responses: {
            200: {
                description: 'Successful response',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'Email sent',
                                value: {
                                    status: SUCCESS_STATUS,
                                    message: "Email sent successful",
                                },
                            },
                        },
                    },
                },
            },
            422: ERROR_EXAMPLE_422,
            404: {
                description: 'Incorrect Email',
                content: {
                    'application/json': {
                        examples: {
                            example1: {
                                summary: 'Incorrect Email',
                                value: {
                                    status: FAILURE_STATUS,
                                    code: ErrorCode.INCORRECT_EMAIL,
                                    message: "Incorrect Email",
                                },
                            },
                        },
                    },
                }
            },
            500: ERROR_EXAMPLE_500
        },
    }
};

export { registerDocs, verifyEmailDocs, resendVerificationEmailDocs }