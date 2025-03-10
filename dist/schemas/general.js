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
exports.SiteDetailSchema = void 0;
const class_transformer_1 = require("class-transformer");
const utils_1 = require("./utils");
class SiteDetailSchema {
}
exports.SiteDetailSchema = SiteDetailSchema;
__decorate([
    (0, utils_1.Example)('SocialNet'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "name", void 0);
__decorate([
    (0, utils_1.Example)('SocialNet'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "email", void 0);
__decorate([
    (0, utils_1.Example)('kayprogrammer1@gmail.com'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "phone", void 0);
__decorate([
    (0, utils_1.Example)('234, Lagos, Nigeria'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "address", void 0);
__decorate([
    (0, utils_1.Example)('https://facebook.com'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "fb", void 0);
__decorate([
    (0, utils_1.Example)('https://twitter.com'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "tw", void 0);
__decorate([
    (0, utils_1.Example)('https://wa.me/2348133831036'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "wh", void 0);
__decorate([
    (0, utils_1.Example)('https://instagram.com'),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SiteDetailSchema.prototype, "ig", void 0);
//# sourceMappingURL=general.js.map