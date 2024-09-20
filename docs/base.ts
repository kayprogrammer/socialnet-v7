import { ErrorCode } from "../config/handlers" 
import { UnprocessableSchema } from "../schemas/base"
import { generateSwaggerResponseExample } from "./utils"

const SUCCESS_STATUS = 'success'
const FAILURE_STATUS = 'failure'
const ERROR_EXAMPLE_500 = generateSwaggerResponseExample('Server Error response', FAILURE_STATUS, "Server Error", null, ErrorCode.SERVER_ERROR)
const ERROR_EXAMPLE_422 = generateSwaggerResponseExample('Unprocessable entity response', FAILURE_STATUS, "Invalid Entry", UnprocessableSchema, ErrorCode.INVALID_ENTRY)
export { SUCCESS_STATUS, FAILURE_STATUS, ERROR_EXAMPLE_500, ERROR_EXAMPLE_422 };