"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const __1 = __importDefault(require(".."));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const utils_1 = require("./utils");
describe('GeneralRoute', () => {
    let mongoServer;
    beforeAll(async () => {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongoServer.stop();
    });
    it('Should return site details', async () => {
        const res = await (0, supertest_1.default)(__1.default).get(`${utils_1.BASE_URL}/general/site-detail`);
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Site Details Fetched');
        const expectedKeys = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
        for (const key of expectedKeys) {
            expect(Object.keys(respBody.data)).toContain(key);
        }
    });
});
//# sourceMappingURL=general.test.js.map