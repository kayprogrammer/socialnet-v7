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
exports.User = exports.City = exports.State = exports.Country = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const utils_1 = require("./utils");
// Create the Country schema
const CountrySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
}, { timestamps: true });
// Create the Country model
const Country = (0, mongoose_1.model)('Country', CountrySchema);
exports.Country = Country;
// Create the State schema
const StateSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    country_: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Country', required: true },
}, { timestamps: true });
// Create the State model
const State = (0, mongoose_1.model)('State', StateSchema);
exports.State = State;
// Create the State schema
const CitySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    state_: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'State', required: true },
}, { timestamps: true });
CitySchema.virtual('state').get(function () {
    return this.state_?.name;
});
CitySchema.virtual('country').get(function () {
    let country = this.state_.country_;
    return country?.name;
});
// Create the City model
const City = (0, mongoose_1.model)('City', CitySchema);
exports.City = City;
// Create the User schema
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, maxlength: 50 },
    lastName: { type: String, required: true, maxlength: 50 },
    username: { type: String, unique: true, blank: true }, // For username, you can generate it before saving
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: mongoose_1.Schema.Types.ObjectId, ref: 'File', null: true, blank: true },
    termsAgreement: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isStaff: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    bio: { type: String, maxlength: 200, default: null, blank: true },
    city_: { type: mongoose_1.Schema.Types.ObjectId, ref: 'City', null: true, blank: true },
    dob: { type: Date, default: null, blank: true },
    tokens: [
        {
            access: { type: String, required: true },
            refresh: { type: String, required: true },
        },
    ], // Using a separate schema to handle this would have probably been better (to handle multiple logins and easier management maybe). While this method can, its advisable that you don't have a long list of active tokens though. So I have intention of setting a limit. (30 login devices).
    otp: { type: Number, null: true, blank: true },
    otpExpiry: { type: Date, null: true, blank: true },
}, { timestamps: true });
UserSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
UserSchema.virtual('avatarUrl').get(function () {
    return (0, utils_1.getFileUrl)(this.avatar, "avatars");
});
UserSchema.virtual('city').get(function () {
    return this.city_?.name || null;
});
// Pre-save hook to generate a unique username
UserSchema.pre('save', async function (next) {
    if (!this.isModified('username') || !this.username) {
        this.username = `${this.firstName}-${this.lastName}`.toLowerCase().replace(/\s+/g, '-');
        // Check for existing username and modify if necessary
        let isUnique = false;
        while (!isUnique) {
            const existingUser = await User.findOne({ username: this.username, _id: { $ne: this._id } });
            if (existingUser) {
                // Add a random 5-character alphanumeric string to make the username unique
                this.username = `${this.username}-${(0, utils_1.randomStringGenerator)(5)}`;
            }
            else {
                isUnique = true;
            }
        }
    }
    next();
});
UserSchema.methods.toString = function () {
    return this.id;
};
// Create the User model
const User = (0, mongoose_1.model)('User', UserSchema);
exports.User = User;
//# sourceMappingURL=accounts.js.map