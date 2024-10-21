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
exports.ReadNotificationSchema = exports.NotificationsResponseSchema = exports.NotificationSchema = exports.AcceptFriendRequestSchema = exports.SendFriendRequestSchema = exports.DeleteUserSchema = exports.CitySchema = exports.ProfileEditResponseSchema = exports.ProfileEditSchema = exports.ProfilesResponseSchema = exports.ProfileSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const base_1 = require("./base");
const class_validator_1 = require("class-validator");
const file_processors_1 = require("../config/file_processors");
const utils_2 = require("../docs/utils");
const profiles_1 = require("../models/profiles");
class ProfileSchema {
}
exports.ProfileSchema = ProfileSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("John"),
    __metadata("design:type", String)
], ProfileSchema.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Doe"),
    __metadata("design:type", String)
], ProfileSchema.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("john-doe"),
    __metadata("design:type", String)
], ProfileSchema.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("johndoe@example.com"),
    __metadata("design:type", String)
], ProfileSchema.prototype, "email", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ProfileSchema.prototype, "avatarUrl", void 0);
__decorate([
    (0, utils_1.Example)("Kenechi Ifeanyi is the best backend engineer for your projects"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ProfileSchema.prototype, "bio", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ProfileSchema.prototype, "dob", void 0);
__decorate([
    (0, utils_1.Example)("Lagos"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ProfileSchema.prototype, "city", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ProfileSchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ProfileSchema.prototype, "updatedAt", void 0);
class ProfilesResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.ProfilesResponseSchema = ProfilesResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(ProfileSchema)]),
    (0, class_transformer_1.Type)(() => ProfileSchema),
    __metadata("design:type", Array)
], ProfilesResponseSchema.prototype, "users", void 0);
class ProfileEditSchema {
}
exports.ProfileEditSchema = ProfileEditSchema;
__decorate([
    (0, utils_1.Example)("John"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(3, 50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileEditSchema.prototype, "firstName", void 0);
__decorate([
    (0, utils_1.Example)("Doe"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.Length)(3, 50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileEditSchema.prototype, "lastName", void 0);
__decorate([
    (0, utils_1.Example)('Software Engineer | Backend Engineer'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ProfileEditSchema.prototype, "bio", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ProfileEditSchema.prototype, "dob", void 0);
__decorate([
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ProfileEditSchema.prototype, "cityId", void 0);
__decorate([
    (0, utils_1.Example)(base_1.FILE_TYPE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_IMAGE_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProfileEditSchema.prototype, "fileType", void 0);
class ProfileEditResponseSchema extends ProfileSchema {
}
exports.ProfileEditResponseSchema = ProfileEditResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.FileUploadDataSchema)),
    __metadata("design:type", base_1.FileUploadDataSchema)
], ProfileEditResponseSchema.prototype, "fileUploadData", void 0);
class CitySchema {
}
exports.CitySchema = CitySchema;
__decorate([
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CitySchema.prototype, "id", void 0);
__decorate([
    (0, utils_1.Example)("Ikeja"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CitySchema.prototype, "name", void 0);
__decorate([
    (0, utils_1.Example)("Lagos"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CitySchema.prototype, "state", void 0);
__decorate([
    (0, utils_1.Example)("Nigeria"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CitySchema.prototype, "country", void 0);
class DeleteUserSchema {
}
exports.DeleteUserSchema = DeleteUserSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("password"),
    __metadata("design:type", String)
], DeleteUserSchema.prototype, "password", void 0);
class SendFriendRequestSchema {
}
exports.SendFriendRequestSchema = SendFriendRequestSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, utils_1.Example)("john-doe"),
    __metadata("design:type", String)
], SendFriendRequestSchema.prototype, "username", void 0);
class AcceptFriendRequestSchema extends SendFriendRequestSchema {
}
exports.AcceptFriendRequestSchema = AcceptFriendRequestSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    (0, utils_1.Example)(true),
    __metadata("design:type", Boolean)
], AcceptFriendRequestSchema.prototype, "accepted", void 0);
class NotificationSchema {
}
exports.NotificationSchema = NotificationSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    __metadata("design:type", String)
], NotificationSchema.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    __metadata("design:type", base_1.UserSchema)
], NotificationSchema.prototype, "sender", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(profiles_1.NOTIFICATION_TYPE_CHOICES.REACTION),
    __metadata("design:type", String)
], NotificationSchema.prototype, "nType", void 0);
__decorate([
    (0, utils_1.Example)("John Doe reacted to your post"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NotificationSchema.prototype, "message", void 0);
__decorate([
    (0, utils_1.Example)(base_1.SLUG_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NotificationSchema.prototype, "postSlug", void 0);
__decorate([
    (0, utils_1.Example)(base_1.SLUG_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NotificationSchema.prototype, "commentSlug", void 0);
__decorate([
    (0, utils_1.Example)(base_1.SLUG_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], NotificationSchema.prototype, "replySlug", void 0);
__decorate([
    (0, utils_1.Example)(true),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], NotificationSchema.prototype, "isRead", void 0);
class NotificationsResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.NotificationsResponseSchema = NotificationsResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(NotificationSchema)]),
    (0, class_transformer_1.Type)(() => NotificationSchema),
    __metadata("design:type", Array)
], NotificationsResponseSchema.prototype, "notifications", void 0);
class ReadNotificationSchema {
}
exports.ReadNotificationSchema = ReadNotificationSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReadNotificationSchema.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(true),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ReadNotificationSchema.prototype, "markAllAsRead", void 0);
//# sourceMappingURL=profiles.js.map