"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const siteDetailSchema = new mongoose_1.Schema({
    name: { type: String, default: "SocialNet", maxlength: 300 },
    email: { type: String, default: "kayprogrammer1@gmail.com" },
    phone: { type: String, default: "+2348133831036", maxlength: 300 },
    address: { type: String, default: "234, Lagos, Nigeria", maxlength: 300 },
    fb: { type: String, default: "https://facebook.com", maxlength: 300 },
    tw: { type: String, default: "https://twitter.com", maxlength: 300 },
    wh: { type: String, default: "https://wa.me/2348133831036", maxlength: 300 },
    ig: { type: String, default: "https://instagram.com", maxlength: 300 },
}, {
    timestamps: true
});
// Pre-save hook to enforce a single instance of SiteDetail
siteDetailSchema.pre('save', async function (next) {
    // Use a type assertion to tell TypeScript that 'this' is of type ISiteDetail
    const existing = await SiteDetail.findOne();
    if (existing && existing._id.toString() !== this._id.toString()) {
        return next(new Error('There can be only one Site Detail instance'));
    }
    next();
});
// Static method to get or create the singleton instance
siteDetailSchema.statics.getOrCreate = async function (data) {
    let siteDetail = await this.findOne();
    if (!siteDetail) {
        siteDetail = await this.create(data);
    }
    return siteDetail;
};
const SiteDetail = mongoose_1.default.model('SiteDetail', siteDetailSchema);
exports.default = SiteDetail;
//# sourceMappingURL=general.js.map