"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config/config"));
const users_1 = require("../managers/users");
const accounts_1 = require("../models/accounts");
const general_1 = __importDefault(require("../models/general"));
const geo_1 = __importDefault(require("./geo"));
const db_1 = __importDefault(require("../config/db"));
const createSuperuser = async () => {
    let userDoc = { email: config_1.default.FIRST_SUPERUSER_EMAIL, password: config_1.default.FIRST_SUPERUSER_PASSWORD, firstName: "Test", lastName: "Admin" };
    const existingUser = await accounts_1.User.findOne({ email: userDoc.email });
    if (!existingUser)
        await (0, users_1.createUser)(userDoc, true, true);
};
const createClientUser = async () => {
    let userDoc = { email: config_1.default.FIRST_CLIENT_EMAIL, password: config_1.default.FIRST_CLIENT_PASSWORD, firstName: "Test", lastName: "Client" };
    const existingUser = await accounts_1.User.findOne({ email: userDoc.email });
    if (!existingUser)
        await (0, users_1.createUser)(userDoc, true);
};
const createData = async () => {
    console.log("GENERATING INITIAL DATA....");
    await (0, db_1.default)();
    await createSuperuser();
    await createClientUser();
    await general_1.default.getOrCreate({});
    await (0, geo_1.default)();
    mongoose_1.default.disconnect();
    console.log("INITIAL DATA GENERATED....");
};
createData();
//# sourceMappingURL=data.js.map