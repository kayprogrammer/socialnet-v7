"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN = exports.ERROR_EXAMPLE_UNAUTHORIZED_USER = exports.ERROR_EXAMPLE_422 = exports.ERROR_EXAMPLE_500 = exports.FAILURE_STATUS = exports.SUCCESS_STATUS = void 0;
const handlers_1 = require("../config/handlers");
const base_1 = require("../schemas/base");
const utils_1 = require("./utils");
const SUCCESS_STATUS = 'success';
exports.SUCCESS_STATUS = SUCCESS_STATUS;
const FAILURE_STATUS = 'failure';
exports.FAILURE_STATUS = FAILURE_STATUS;
const ERROR_EXAMPLE_500 = (0, utils_1.generateSwaggerResponseExample)('Server Error response', FAILURE_STATUS, "Server Error", null, handlers_1.ErrorCode.SERVER_ERROR);
exports.ERROR_EXAMPLE_500 = ERROR_EXAMPLE_500;
const ERROR_EXAMPLE_422 = (0, utils_1.generateSwaggerResponseExample)('Unprocessable entity response', FAILURE_STATUS, "Invalid Entry", base_1.UnprocessableSchema, handlers_1.ErrorCode.INVALID_ENTRY);
exports.ERROR_EXAMPLE_422 = ERROR_EXAMPLE_422;
const ERROR_EXAMPLE_UNAUTHORIZED_USER = (0, utils_1.generateSwaggerResponseExample)('Unauthorized User', FAILURE_STATUS, "Unauthorized user", null, handlers_1.ErrorCode.UNAUTHORIZED_USER);
exports.ERROR_EXAMPLE_UNAUTHORIZED_USER = ERROR_EXAMPLE_UNAUTHORIZED_USER;
const ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN = {
    ...ERROR_EXAMPLE_UNAUTHORIZED_USER,
    content: {
        'application/json': {
            examples: {
                example1: ERROR_EXAMPLE_UNAUTHORIZED_USER.content["application/json"].examples.example1,
                example2: (0, utils_1.generateSwaggerExampleValue)("Invalid Access Token", FAILURE_STATUS, "Access token is invalid or expired", null, handlers_1.ErrorCode.INVALID_TOKEN),
            },
        },
    },
};
exports.ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN = ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN;
//# sourceMappingURL=base.js.map