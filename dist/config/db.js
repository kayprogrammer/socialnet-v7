"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const connectDB = async (uri = config_1.default.MONGO_URI) => {
    try {
        await mongoose_1.default.connect(uri);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process with failure
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map