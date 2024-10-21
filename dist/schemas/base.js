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
exports.SLUG_EXAMPLE = exports.ID_EXAMPLE = exports.FILE_TYPE_EXAMPLE = exports.DATETIME_EXAMPLE = exports.IMAGE_EXAMPLE = exports.PaginatedResponseSchema = exports.UnprocessableSchema = exports.FileUploadDataSchema = exports.UserSchema = exports.EmailSchema = exports.ResponseSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const class_validator_1 = require("class-validator");
class ResponseSchema {
    constructor() {
        this.status = "success";
    }
}
exports.ResponseSchema = ResponseSchema;
class EmailSchema {
}
exports.EmailSchema = EmailSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("johndoe@example.com"),
    (0, class_validator_1.IsEmail)({}, { message: "Enter a valid email address" }),
    __metadata("design:type", String)
], EmailSchema.prototype, "email", void 0);
class UserSchema {
}
exports.UserSchema = UserSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("John Doe"),
    __metadata("design:type", String)
], UserSchema.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("john-doe"),
    __metadata("design:type", String)
], UserSchema.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("https://img.com/john"),
    __metadata("design:type", String)
], UserSchema.prototype, "avatarUrl", void 0);
class FileUploadDataSchema {
}
exports.FileUploadDataSchema = FileUploadDataSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("5f47ac29e7d1b644a81e1e1a"),
    __metadata("design:type", String)
], FileUploadDataSchema.prototype, "publicId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("mE4BQwZ9q6R7aDgI56m8Nx5Vx4U"),
    __metadata("design:type", String)
], FileUploadDataSchema.prototype, "signature", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("1638307200"),
    __metadata("design:type", String)
], FileUploadDataSchema.prototype, "timestamp", void 0);
class UnprocessableSchema {
}
exports.UnprocessableSchema = UnprocessableSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("This field is required"),
    __metadata("design:type", String)
], UnprocessableSchema.prototype, "field1", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Ensure this is a valid type"),
    __metadata("design:type", String)
], UnprocessableSchema.prototype, "field2", void 0);
class PaginatedResponseSchema {
}
exports.PaginatedResponseSchema = PaginatedResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(1),
    __metadata("design:type", Number)
], PaginatedResponseSchema.prototype, "page", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(100),
    __metadata("design:type", Number)
], PaginatedResponseSchema.prototype, "itemsCount", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(2),
    __metadata("design:type", Number)
], PaginatedResponseSchema.prototype, "totalPages", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(50),
    __metadata("design:type", Number)
], PaginatedResponseSchema.prototype, "itemsPerPage", void 0);
const IMAGE_EXAMPLE = "https://image.com/whatever";
exports.IMAGE_EXAMPLE = IMAGE_EXAMPLE;
const DATETIME_EXAMPLE = "2024-09-22T14:30:00Z";
exports.DATETIME_EXAMPLE = DATETIME_EXAMPLE;
const FILE_TYPE_EXAMPLE = "image/png";
exports.FILE_TYPE_EXAMPLE = FILE_TYPE_EXAMPLE;
const ID_EXAMPLE = "507f1f77bcf86cd799439011";
exports.ID_EXAMPLE = ID_EXAMPLE;
const SLUG_EXAMPLE = `john-doe-${ID_EXAMPLE}`;
exports.SLUG_EXAMPLE = SLUG_EXAMPLE;
//# sourceMappingURL=base.js.map