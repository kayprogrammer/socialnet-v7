"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example = Example;
require("reflect-metadata");
function Example(value) {
    return (target, propertyKey) => {
        Reflect.defineMetadata('example', value, target, propertyKey);
    };
}
//# sourceMappingURL=utils.js.map