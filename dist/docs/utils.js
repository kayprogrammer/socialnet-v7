"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSwaggerRequestExample = generateSwaggerRequestExample;
exports.generateSwaggerResponseExample = generateSwaggerResponseExample;
exports.generateSwaggerExampleValue = generateSwaggerExampleValue;
exports.generateSwaggerExampleFromSchema = generateSwaggerExampleFromSchema;
exports.generateParamExample = generateParamExample;
exports.generatePaginationParamExample = generatePaginationParamExample;
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
function generateSwaggerExampleFromSchema(cls) {
    const examples = {};
    const instance = (0, class_transformer_1.plainToClass)(cls, {});
    const keys = Object.keys(instance);
    keys.forEach((key) => {
        const example = Reflect.getMetadata('example', instance, key);
        if (example !== undefined) {
            examples[key] = example;
        }
    });
    return examples;
}
function generateSwaggerRequestExample(summary, schemaClass, contentType = "application/json") {
    return {
        content: {
            [contentType]: {
                examples: {
                    example1: {
                        summary: summary + " body example",
                        value: generateSwaggerExampleFromSchema(schemaClass)
                    }
                }
            },
        },
        required: true
    };
}
function generateSwaggerExampleValue(summary, status, message, schemaClass, code) {
    let responseValue = {
        status: status,
        message: message,
        ...(code && { code: code }),
        ...(schemaClass && { data: generateSwaggerExampleFromSchema(schemaClass) })
    };
    return {
        summary: summary,
        value: responseValue,
    };
}
function generateSwaggerResponseExample(description, status, message, schemaClass, code, isArray = false) {
    let exampleValue = generateSwaggerExampleValue("An example response", status, message, schemaClass, code);
    if (isArray)
        exampleValue = [exampleValue];
    return {
        description: description,
        content: {
            'application/json': {
                examples: {
                    example1: exampleValue,
                },
            },
        },
    };
}
function generateParamExample(name, description, type, example, location = "query") {
    let required = false;
    if (location === "path")
        required = true;
    return {
        name,
        in: location,
        required,
        description,
        schema: {
            type,
            example
        }
    };
}
function generatePaginationParamExample(objString) {
    return [
        generateParamExample("page", `Current page of ${objString} to fetch`, "integer", 1),
        generateParamExample("limit", `Number of ${objString} per page to fetch`, "integer", 100),
    ];
}
//# sourceMappingURL=utils.js.map