"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteDetailDocs = void 0;
const general_1 = require("../schemas/general");
const utils_1 = require("./utils");
const base_1 = require("./base");
exports.siteDetailDocs = {
    get: {
        tags: ['General (1)'],
        summary: 'Get site details',
        description: "Fetch details about the site like name, email, address, etc.",
        responses: {
            200: (0, utils_1.generateSwaggerResponseExample)('Successful response', base_1.SUCCESS_STATUS, "Site details fetched", general_1.SiteDetailSchema),
            500: base_1.ERROR_EXAMPLE_500
        }
    }
};
//# sourceMappingURL=general.js.map