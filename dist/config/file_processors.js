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
exports.ALLOWED_FILE_TYPES = exports.ALLOWED_DOCUMENT_TYPES = exports.ALLOWED_AUDIO_TYPES = exports.ALLOWED_IMAGE_TYPES = void 0;
const cloudinary = __importStar(require("cloudinary"));
const mime = __importStar(require("mime-types"));
const config_1 = __importDefault(require("./config"));
const BASE_FOLDER = "socialnet-v7/";
cloudinary.v2.config({
    cloud_name: config_1.default.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.default.CLOUDINARY_API_KEY,
    api_secret: config_1.default.CLOUDINARY_API_SECRET,
});
class FileProcessor {
    static generateFileSignature(key, folder) {
        const publicId = `${BASE_FOLDER}${folder}/${key}`;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = { publicId, timestamp };
        try {
            const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, config_1.default.CLOUDINARY_API_SECRET);
            return { publicId, signature, timestamp };
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    static generateFileUrl(key, folder, contentType) {
        const fileExtension = mime.extension(contentType) ? `.${mime.extension(contentType)}` : '';
        const publicId = `${BASE_FOLDER}${folder}/${key}${fileExtension}`;
        try {
            const url = cloudinary.v2.url(publicId, { secure: true });
            return url;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}
var ALLOWED_IMAGE_TYPES;
(function (ALLOWED_IMAGE_TYPES) {
    ALLOWED_IMAGE_TYPES["IMAGE_BMP"] = "image/bmp";
    ALLOWED_IMAGE_TYPES["IMAGE_GIF"] = "image/gif";
    ALLOWED_IMAGE_TYPES["IMAGE_JPEG"] = "image/jpeg";
    ALLOWED_IMAGE_TYPES["IMAGE_PNG"] = "image/png";
    ALLOWED_IMAGE_TYPES["IMAGE_TIFF"] = "image/tiff";
    ALLOWED_IMAGE_TYPES["IMAGE_WEBP"] = "image/webp";
})(ALLOWED_IMAGE_TYPES || (exports.ALLOWED_IMAGE_TYPES = ALLOWED_IMAGE_TYPES = {}));
var ALLOWED_AUDIO_TYPES;
(function (ALLOWED_AUDIO_TYPES) {
    ALLOWED_AUDIO_TYPES["AUDIO_MP3"] = "audio/mp3";
    ALLOWED_AUDIO_TYPES["AUDIO_AAC"] = "audio/aac";
    ALLOWED_AUDIO_TYPES["AUDIO_WAV"] = "audio/wav";
    ALLOWED_AUDIO_TYPES["AUDIO_M4A"] = "audio/m4a";
})(ALLOWED_AUDIO_TYPES || (exports.ALLOWED_AUDIO_TYPES = ALLOWED_AUDIO_TYPES = {}));
var ALLOWED_DOCUMENT_TYPES;
(function (ALLOWED_DOCUMENT_TYPES) {
    ALLOWED_DOCUMENT_TYPES["APPLICATION_PDF"] = "application/pdf";
    ALLOWED_DOCUMENT_TYPES["APPLICATION_MSWORD"] = "application/msword";
})(ALLOWED_DOCUMENT_TYPES || (exports.ALLOWED_DOCUMENT_TYPES = ALLOWED_DOCUMENT_TYPES = {}));
exports.ALLOWED_FILE_TYPES = { ...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_DOCUMENT_TYPES };
exports.default = FileProcessor;
//# sourceMappingURL=file_processors.js.map