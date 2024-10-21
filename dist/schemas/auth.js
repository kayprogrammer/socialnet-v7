"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = exports.TokensSchema = exports.LoginSchema = exports.SetNewPasswordSchema = exports.VerifyEmailSchema = exports.RegisterSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const class_validator_1 = require("class-validator");
const base_1 = require("./base");
class RegisterSchema {
}
exports.RegisterSchema = RegisterSchema;
__decorate([
    (0, utils_1.Example)('John'),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(3, 50),
    __metadata("design:type", String)
], RegisterSchema.prototype, "firstName", void 0);
__decorate([
    (0, utils_1.Example)('Doe'),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(3, 50),
    __metadata("design:type", String)
], RegisterSchema.prototype, "lastName", void 0);
__decorate([
    (0, utils_1.Example)('johndoe@example.com'),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Enter a valid email address" }),
    __metadata("design:type", String)
], RegisterSchema.prototype, "email", void 0);
__decorate([
    (0, utils_1.Example)('strongpassword'),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(8, 50),
    __metadata("design:type", String)
], RegisterSchema.prototype, "password", void 0);
__decorate([
    (0, utils_1.Example)(true),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], RegisterSchema.prototype, "termsAgreement", void 0);
class VerifyEmailSchema extends base_1.EmailSchema {
}
exports.VerifyEmailSchema = VerifyEmailSchema;
__decorate([
    (0, utils_1.Example)(123456),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Min)(100000),
    (0, class_validator_1.Max)(999999),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VerifyEmailSchema.prototype, "otp", void 0);
class SetNewPasswordSchema extends VerifyEmailSchema {
}
exports.SetNewPasswordSchema = SetNewPasswordSchema;
__decorate([
    (0, utils_1.Example)("newstrongpassword"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(8, 50),
    __metadata("design:type", String)
], SetNewPasswordSchema.prototype, "password", void 0);
class LoginSchema {
}
exports.LoginSchema = LoginSchema;
__decorate([
    (0, utils_1.Example)('johndoe@example.com'),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Enter a valid email address" }),
    __metadata("design:type", String)
], LoginSchema.prototype, "email", void 0);
__decorate([
    (0, utils_1.Example)("password"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(8, 50),
    __metadata("design:type", String)
], LoginSchema.prototype, "password", void 0);
const TOKEN_EXAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
class TokensSchema {
}
exports.TokensSchema = TokensSchema;
__decorate([
    (0, utils_1.Example)(TOKEN_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], TokensSchema.prototype, "access", void 0);
__decorate([
    (0, utils_1.Example)(TOKEN_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], TokensSchema.prototype, "refresh", void 0);
class RefreshTokenSchema {
}
exports.RefreshTokenSchema = RefreshTokenSchema;
__decorate([
    (0, utils_1.Example)(TOKEN_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RefreshTokenSchema.prototype, "refresh", void 0);
//# sourceMappingURL=auth.js.map