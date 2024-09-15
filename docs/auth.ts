import { RegisterSchema } from "../schemas/auth";
import { SiteDetailSchema } from "../schemas/general";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, SUCCESS_STATUS } from "./base";
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

export { registerDocs }