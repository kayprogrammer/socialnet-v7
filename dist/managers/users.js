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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortUserPopulation = exports.decodeAuth = exports.verifyRefreshToken = exports.createRefreshToken = exports.createAccessToken = exports.checkPassword = exports.hashPassword = exports.createOtp = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const accounts_1 = require("../models/accounts");
const config_1 = __importDefault(require("../config/config"));
const jwt = __importStar(require("jsonwebtoken"));
const utils_1 = require("../config/utils");
const hashPassword = async (password) => {
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    return hashedPassword;
};
exports.hashPassword = hashPassword;
const checkPassword = async (user, password) => {
    return await bcryptjs_1.default.compare(password, user.password);
};
exports.checkPassword = checkPassword;
const createUser = async (userData, isEmailVerified = false, isStaff = false) => {
    const { password, ...otherUserData } = userData;
    const hashedPassword = await hashPassword(password);
    const newUser = await accounts_1.User.create({ password: hashedPassword, isStaff, isEmailVerified, ...otherUserData });
    return newUser;
};
exports.createUser = createUser;
const createOtp = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + config_1.default.EMAIL_OTP_EXPIRE_SECONDS * 1000); // OTP expiry in 15 minutes
    await accounts_1.User.updateOne({ _id: user._id }, { $set: { otp, otpExpiry } });
    return otp;
};
exports.createOtp = createOtp;
// Authentication Tokens
const ALGORITHM = "HS256";
const createAccessToken = (userId) => {
    let payload = { userId, exp: Math.floor(Date.now() / 1000) + (config_1.default.ACCESS_TOKEN_EXPIRY * 60) };
    return jwt.sign(payload, config_1.default.SECRET_KEY, { algorithm: ALGORITHM });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = () => {
    const payload = { data: (0, utils_1.randomStr)(10), exp: Math.floor(Date.now() / 1000) + (config_1.default.REFRESH_TOKEN_EXPIRY * 60) };
    return jwt.sign(payload, config_1.default.SECRET_KEY, { algorithm: ALGORITHM });
};
exports.createRefreshToken = createRefreshToken;
const verifyAsync = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
};
const verifyRefreshToken = async (token) => {
    try {
        const decoded = await verifyAsync(token, config_1.default.SECRET_KEY);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeAuth = async (token) => {
    try {
        const decoded = await verifyAsync(token, config_1.default.SECRET_KEY);
        const userId = decoded?.userId;
        if (!userId) {
            return null;
        }
        const user = await accounts_1.User.findOne({ _id: userId, "tokens.access": token }).populate([{ path: "city_", populate: { path: "state_", populate: { path: "country_" } } }, "avatar"]);
        return user;
    }
    catch (error) {
        return null;
    }
};
exports.decodeAuth = decodeAuth;
const shortUserPopulation = (field) => {
    return { path: field, select: "firstName lastName username avatar", populate: { path: 'avatar' } };
};
exports.shortUserPopulation = shortUserPopulation;
//# sourceMappingURL=users.js.map