"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const general_1 = __importDefault(require("../models/general"));
const general_2 = require("../schemas/general");
const utils_1 = require("../config/utils");
const generalRouter = (0, express_1.Router)();
generalRouter.get('/site-detail', async (req, res, next) => {
    try {
        const siteDetail = await general_1.default.getOrCreate({});
        return res.status(200).json(utils_1.CustomResponse.success('Site Details Fetched', siteDetail, general_2.SiteDetailSchema));
    }
    catch (error) {
        next(error);
    }
});
exports.default = generalRouter;
//# sourceMappingURL=general.js.map