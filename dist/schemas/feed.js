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
exports.CommentWithRepliesSchema = exports.RepliesResponseSchema = exports.CommentsResponseSchema = exports.CommentCreateSchema = exports.CommentSchema = exports.ReplySchema = exports.ReactionsResponseSchema = exports.ReactionCreateSchema = exports.ReactionSchema = exports.PostCreateResponseSchema = exports.PostsResponseSchema = exports.PostCreateSchema = exports.PostSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
const base_1 = require("./base");
const class_validator_1 = require("class-validator");
const file_processors_1 = require("../config/file_processors");
const utils_2 = require("../docs/utils");
const feed_1 = require("../models/feed");
const SLUG_EXAMPLE = `john-doe-507f1f77bcf86cd799439011`;
class PostSchema {
}
exports.PostSchema = PostSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    __metadata("design:type", base_1.UserSchema)
], PostSchema.prototype, "author", void 0);
__decorate([
    (0, utils_1.Example)('Jesus is Lord'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PostSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(SLUG_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PostSchema.prototype, "slug", void 0);
__decorate([
    (0, utils_1.Example)(base_1.IMAGE_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PostSchema.prototype, "imageUrl", void 0);
__decorate([
    (0, utils_1.Example)(10),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], PostSchema.prototype, "reactionsCount", void 0);
__decorate([
    (0, utils_1.Example)(10),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], PostSchema.prototype, "commentsCount", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], PostSchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], PostSchema.prototype, "updatedAt", void 0);
class PostCreateSchema {
}
exports.PostCreateSchema = PostCreateSchema;
__decorate([
    (0, utils_1.Example)("Jesus is Lord"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostCreateSchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)("image/png"),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(file_processors_1.ALLOWED_IMAGE_TYPES),
    __metadata("design:type", String)
], PostCreateSchema.prototype, "fileType", void 0);
class PostsResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.PostsResponseSchema = PostsResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => PostSchema),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(PostSchema)]),
    __metadata("design:type", Array)
], PostsResponseSchema.prototype, "posts", void 0);
class PostCreateResponseSchema extends PostSchema {
}
exports.PostCreateResponseSchema = PostCreateResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.FileUploadDataSchema)),
    __metadata("design:type", base_1.FileUploadDataSchema)
], PostCreateResponseSchema.prototype, "fileUploadData", void 0);
class ReactionSchema {
}
exports.ReactionSchema = ReactionSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    (0, class_transformer_1.Type)(() => base_1.UserSchema),
    __metadata("design:type", base_1.UserSchema)
], ReactionSchema.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(feed_1.REACTION_CHOICES_ENUM.LIKE),
    __metadata("design:type", String)
], ReactionSchema.prototype, "rType", void 0);
class ReactionCreateSchema {
}
exports.ReactionCreateSchema = ReactionCreateSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)(feed_1.REACTION_CHOICES_ENUM.LIKE),
    (0, class_validator_1.IsEnum)(feed_1.REACTION_CHOICES_ENUM),
    __metadata("design:type", String)
], ReactionCreateSchema.prototype, "rType", void 0);
class ReactionsResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.ReactionsResponseSchema = ReactionsResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ReactionSchema),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(ReactionSchema)]),
    __metadata("design:type", Array)
], ReactionsResponseSchema.prototype, "reactions", void 0);
class ReplySchema {
}
exports.ReplySchema = ReplySchema;
__decorate([
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(base_1.UserSchema)),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", base_1.UserSchema)
], ReplySchema.prototype, "author", void 0);
__decorate([
    (0, utils_1.Example)(SLUG_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ReplySchema.prototype, "slug", void 0);
__decorate([
    (0, utils_1.Example)("My name is Kenechi Ifeanyi"),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ReplySchema.prototype, "text", void 0);
__decorate([
    (0, utils_1.Example)(10),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ReplySchema.prototype, "reactionsCount", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ReplySchema.prototype, "createdAt", void 0);
__decorate([
    (0, utils_1.Example)(base_1.DATETIME_EXAMPLE),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", Date)
], ReplySchema.prototype, "updatedAt", void 0);
class CommentSchema extends ReplySchema {
}
exports.CommentSchema = CommentSchema;
__decorate([
    (0, utils_1.Example)(10),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CommentSchema.prototype, "repliesCount", void 0);
class CommentCreateSchema {
}
exports.CommentCreateSchema = CommentCreateSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, utils_1.Example)("Kenechi Ifeanyi Is The Best Backend Engineer"),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CommentCreateSchema.prototype, "text", void 0);
class CommentsResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.CommentsResponseSchema = CommentsResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CommentSchema),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(CommentSchema)]),
    __metadata("design:type", Array)
], CommentsResponseSchema.prototype, "comments", void 0);
class RepliesResponseSchema extends base_1.PaginatedResponseSchema {
}
exports.RepliesResponseSchema = RepliesResponseSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ReplySchema),
    (0, utils_1.Example)([(0, utils_2.generateSwaggerExampleFromSchema)(ReplySchema)]),
    __metadata("design:type", Array)
], RepliesResponseSchema.prototype, "items", void 0);
class CommentWithRepliesSchema {
}
exports.CommentWithRepliesSchema = CommentWithRepliesSchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => CommentSchema),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(CommentSchema)),
    __metadata("design:type", CommentSchema)
], CommentWithRepliesSchema.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => RepliesResponseSchema),
    (0, utils_1.Example)((0, utils_2.generateSwaggerExampleFromSchema)(RepliesResponseSchema)),
    __metadata("design:type", RepliesResponseSchema)
], CommentWithRepliesSchema.prototype, "replies", void 0);
//# sourceMappingURL=feed.js.map