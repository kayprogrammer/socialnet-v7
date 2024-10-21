"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const mongoose_1 = require("mongoose");
// Create the File schema
const FileSchema = new mongoose_1.Schema({
    resourceType: { type: String, required: true, maxlength: 200 },
}, { timestamps: true });
// Add a method to return the ID as a string 
FileSchema.methods.toString = function () {
    return this._id.toString();
};
// Create the File model
const File = (0, mongoose_1.model)('File', FileSchema);
exports.File = File;
//# sourceMappingURL=base.js.map