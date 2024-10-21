"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDictAttr = exports.randomStr = exports.CustomResponse = exports.convertSchemaData = void 0;
const class_transformer_1 = require("class-transformer");
const convertSchemaData = (dataSchema, data) => {
    return (0, class_transformer_1.plainToInstance)(dataSchema, data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
    });
};
exports.convertSchemaData = convertSchemaData;
class CustomResponse {
    static success(message, data, dataSchema) {
        let response = {
            status: "success",
            message
        };
        if (dataSchema && data !== undefined) {
            response.data = (0, exports.convertSchemaData)(dataSchema, data);
        }
        else {
            response.data = data;
        }
        return response;
    }
    static error(message, code, data) {
        var resp = {
            status: "failure",
            code,
            message,
        };
        if (data)
            resp.data = data;
        return resp;
    }
}
exports.CustomResponse = CustomResponse;
const randomStr = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }
    return randomString;
};
exports.randomStr = randomStr;
const setDictAttr = (from, to) => {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
};
exports.setDictAttr = setDictAttr;
//# sourceMappingURL=utils.js.map