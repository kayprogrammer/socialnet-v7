import { ErrorCode } from "../config/handlers" 

const SUCCESS_STATUS = 'success'
const FAILURE_STATUS = 'failure'

const ERROR_EXAMPLE_500 = {
    description: 'Server Error response',
    content: {
        'application/json': {
            examples: {
                example1: {
                    summary: 'Server Error',
                    value: {
                        status: FAILURE_STATUS,
                        code: ErrorCode.SERVER_ERROR,
                        message: "Server Error",
                    },
                },
            },
        },
    }
}

const ERROR_EXAMPLE_422 = {
    description: 'Unprocessable entity response',
    content: {
        'application/json': {
            examples: {
                example1: {
                    summary: 'Unprocessable entity',
                    value: {
                        status: FAILURE_STATUS,
                        code: ErrorCode.INVALID_ENTRY,
                        message: "Invalid Entry",
                        data: {
                            field1: "This field is required",
                            field: "Ensure this is a valid type"
                        }
                    },
                },
            },
        },
    }
}

export { SUCCESS_STATUS, FAILURE_STATUS, ERROR_EXAMPLE_500, ERROR_EXAMPLE_422 }