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

export { SUCCESS_STATUS, FAILURE_STATUS, ERROR_EXAMPLE_500 }