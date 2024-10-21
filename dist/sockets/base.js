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
exports.SOCKET_STATUS_CHOICES = exports.SocketEntrySchema = exports.removeClient = exports.addClient = exports.chatClients = exports.notificationClients = exports.validateSocketEntry = exports.WSError = void 0;
const class_transformer_1 = require("class-transformer");
const handlers_1 = require("../config/handlers");
const class_validator_1 = require("class-validator");
const WSError = (ws, code, eType, message, data = null) => {
    let response = {
        status: "failure",
        type: eType,
        message
    };
    if (data)
        response.data = data;
    ws.send(JSON.stringify(response));
    ws.close(code, message);
    return true;
};
exports.WSError = WSError;
const validateSocketEntry = async (ws, body, schema) => {
    let parsedBody = {};
    try {
        parsedBody = JSON.parse(body);
        const instance = (0, class_transformer_1.plainToInstance)(schema, parsedBody);
        const errors = await (0, class_validator_1.validate)(instance);
        if (errors.length > 0) {
            const formattedErrors = errors.reduce((acc, error) => {
                if (error.constraints) {
                    // Get the first constraint message
                    const [firstConstraint] = Object.values(error.constraints);
                    acc[error.property] = firstConstraint;
                }
                return acc;
            }, {});
            WSError(ws, 4220, handlers_1.ErrorCode.INVALID_ENTRY, "Invalid Entry", formattedErrors);
        }
    }
    catch {
        WSError(ws, 4220, handlers_1.ErrorCode.INVALID_ENTRY, "Invalid JSON");
    }
    return parsedBody;
};
exports.validateSocketEntry = validateSocketEntry;
const notificationClients = new Set(); // Store all connected WebSocket clients
exports.notificationClients = notificationClients;
const chatClients = new Set(); // Store all connected WebSocket clients
exports.chatClients = chatClients;
// Add client to the list when they connect
const addClient = (ws, wType = "notification") => {
    if (wType === "notification") {
        notificationClients.add(ws);
    }
    else {
        chatClients.add(ws);
    }
};
exports.addClient = addClient;
// Remove client from the list when they disconnect
const removeClient = (ws, wType = "notification") => {
    if (wType === "notification") {
        notificationClients.delete(ws);
    }
    else {
        chatClients.delete(ws);
    }
};
exports.removeClient = removeClient;
var SOCKET_STATUS_CHOICES;
(function (SOCKET_STATUS_CHOICES) {
    SOCKET_STATUS_CHOICES["CREATED"] = "CREATED";
    SOCKET_STATUS_CHOICES["UPDATED"] = "UPDATED";
    SOCKET_STATUS_CHOICES["DELETED"] = "DELETED";
})(SOCKET_STATUS_CHOICES || (exports.SOCKET_STATUS_CHOICES = SOCKET_STATUS_CHOICES = {}));
class SocketEntrySchema {
}
exports.SocketEntrySchema = SocketEntrySchema;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(SOCKET_STATUS_CHOICES),
    __metadata("design:type", String)
], SocketEntrySchema.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SocketEntrySchema.prototype, "id", void 0);
//# sourceMappingURL=base.js.map