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
exports.UpdateMessageSchema = exports.GroupChatInputResponseSchema = exports.GroupChatSchema = exports.GroupUpdateSchema = exports.GroupCreateSchema = exports.MessagesResponseSchema = exports.MessagesDataSchema = exports.MessageSentResponseSchema = exports.SendMessageSchema = exports.ChatsResponseSchema = exports.MessageSchema = exports.ChatSchema = exports.LatestMessageSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const base_1 = require("./base");
const utils_2 = require("../docs/utils");
const chat_1 = require("../models/chat");
const class_validator_1 = require("class-validator");
const file_processors_1 = require("../config/file_processors");
class LatestMessageSchema {
}
exports.LatestMessageSchema = LatestMessageSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    __metadata("design:type", base_1.UserSchema)
], LatestMessageSchema.prototype, "sender", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("God is good"),
    __metadata("design:type", String)
], LatestMessageSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LatestMessageSchema.prototype, "fileUrl", void 0);
class ChatSchema {
}
exports.ChatSchema = ChatSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    __metadata("design:type", String)
], ChatSchema.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("My Group"),
    __metadata("design:type", String)
], ChatSchema.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    __metadata("design:type", base_1.UserSchema)
], ChatSchema.prototype, "owner", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(chat_1.CHAT_TYPE_CHOICES.DM),
    __metadata("design:type", String)
], ChatSchema.prototype, "cType", void 0);
__decorate([
    (0, utils_1.Example)("This is a good group of mine"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatSchema.prototype, "description", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ChatSchema.prototype, "imageUrl", void 0);
__decorate([
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(LatestMessageSchema)),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", LatestMessageSchema)
], ChatSchema.prototype, "latestMessage", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ChatSchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ChatSchema.prototype, "updatedAt", void 0);
class MessageSchema {
}
exports.MessageSchema = MessageSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    __metadata("design:type", String)
], MessageSchema.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    __metadata("design:type", String)
], MessageSchema.prototype, "chatId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    __metadata("design:type", base_1.UserSchema)
], MessageSchema.prototype, "sender", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("God is Good"),
    __metadata("design:type", String)
], MessageSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MessageSchema.prototype, "fileUrl", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], MessageSchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], MessageSchema.prototype, "updatedAt", void 0);
class ChatsResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.ChatsResponseSchema = ChatsResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(ChatSchema)]),
    (0, class_transformer_1.Type)(() => ChatSchema),
    __metadata("design:type", Array)
], ChatsResponseSchema.prototype, "chats", void 0);
class SendMessageSchema {
}
exports.SendMessageSchema = SendMessageSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageSchema.prototype, "chatId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("john-doe"),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageSchema.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Kenechi is the best"),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(base_1.FILE_TYPE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_FILE_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageSchema.prototype, "fileType", void 0);
class MessageSentResponseSchema extends MessageSchema {
}
exports.MessageSentResponseSchema = MessageSentResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.FileUploadDataSchema)),
    __metadata("design:type", base_1.FileUploadDataSchema)
], MessageSentResponseSchema.prototype, "fileUploadData", void 0);
class MessagesDataSchema extends base_1.PaginatedResponseSchema {
}
exports.MessagesDataSchema = MessagesDataSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(MessageSchema)]),
    (0, class_transformer_1.Type)(() => MessageSchema),
    __metadata("design:type", Array)
], MessagesDataSchema.prototype, "items", void 0);
class MessagesResponseSchema {
}
exports.MessagesResponseSchema = MessagesResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(ChatSchema)),
    __metadata("design:type", ChatSchema)
], MessagesResponseSchema.prototype, "chat", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(MessagesDataSchema)),
    __metadata("design:type", MessagesDataSchema)
], MessagesResponseSchema.prototype, "messages", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)]),
    (0, class_transformer_1.Type)(() => base_1.UserSchema),
    __metadata("design:type", Array)
], MessagesResponseSchema.prototype, "users", void 0);
class GroupCreateSchema {
}
exports.GroupCreateSchema = GroupCreateSchema;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 50),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Best Group"),
    __metadata("design:type", String)
], GroupCreateSchema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 500),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("This is the best group you'll ever come across"),
    __metadata("design:type", String)
], GroupCreateSchema.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(99),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(["john-doe"]),
    __metadata("design:type", Array)
], GroupCreateSchema.prototype, "usernamesToAdd", void 0);
__decorate([
    (0, utils_1.Example)(base_1.FILE_TYPE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_FILE_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupCreateSchema.prototype, "fileType", void 0);
class GroupUpdateSchema {
}
exports.GroupUpdateSchema = GroupUpdateSchema;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 50),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Best Group"),
    __metadata("design:type", String)
], GroupUpdateSchema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 500),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("This is the best group you'll ever come across"),
    __metadata("design:type", String)
], GroupUpdateSchema.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(99),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(["john-doe"]),
    __metadata("design:type", Array)
], GroupUpdateSchema.prototype, "usernamesToAdd", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(99),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(["john-doe"]),
    __metadata("design:type", Array)
], GroupUpdateSchema.prototype, "usernamesToRemove", void 0);
__decorate([
    (0, utils_1.Example)(base_1.FILE_TYPE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_FILE_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupUpdateSchema.prototype, "fileType", void 0);
class GroupChatSchema {
}
exports.GroupChatSchema = GroupChatSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(base_1.ID_EXAMPLE),
    __metadata("design:type", String)
], GroupChatSchema.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("My Group"),
    __metadata("design:type", String)
], GroupChatSchema.prototype, "name", void 0);
__decorate([
    (0, utils_1.Example)("This is a good group of mine"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GroupChatSchema.prototype, "description", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GroupChatSchema.prototype, "imageUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)]),
    (0, class_transformer_1.Type)(() => base_1.UserSchema),
    __metadata("design:type", Array)
], GroupChatSchema.prototype, "users", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], GroupChatSchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], GroupChatSchema.prototype, "updatedAt", void 0);
class GroupChatInputResponseSchema extends GroupChatSchema {
}
exports.GroupChatInputResponseSchema = GroupChatInputResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.FileUploadDataSchema)),
    __metadata("design:type", base_1.FileUploadDataSchema)
], GroupChatInputResponseSchema.prototype, "fileUploadData", void 0);
class UpdateMessageSchema {
}
exports.UpdateMessageSchema = UpdateMessageSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Kenechi is the best"),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMessageSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(base_1.FILE_TYPE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_FILE_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMessageSchema.prototype, "fileType", void 0);
//# sourceMappingURL=chats.js.map