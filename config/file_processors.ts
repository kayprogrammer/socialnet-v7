import * as cloudinary from 'cloudinary';
import { promisify } from 'util';
import * as mime from 'mime-types';
import ENV from './config';

const BASE_FOLDER = "socialnet-v7/";

cloudinary.v2.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

class FileProcessor {
    static generateFileSignature(key: string, folder: string): { publicId: string; signature: string; timestamp: string } | null {
        const publicId = `${BASE_FOLDER}${folder}/${key}`;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = { publicId, timestamp };

        try {
            const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, ENV.CLOUDINARY_API_SECRET);
            return { publicId, signature, timestamp };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static generateFileUrl(key: string, folder: string, contentType: string): string | null {
        const fileExtension = mime.extension(contentType) ? `.${mime.extension(contentType)}` : '';
        const publicId = `${BASE_FOLDER}${folder}/${key}${fileExtension}`;

        try {
            const url = cloudinary.v2.url(publicId, { secure: true });
            return url;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static async uploadFile(file: Express.Multer.File, key: string, folder: string): Promise<void> {
        const publicId = `${BASE_FOLDER}${folder}/${key}`;

        try {
            await cloudinary.v2.uploader.upload(file.path, { public_id: publicId, overwrite: true, faces: true });
        } catch (error) {
            console.error(error);
        }
    }
}

export enum ALLOWED_IMAGE_TYPES {
    IMAGE_BMP = 'image/bmp',
    IMAGE_GIF = 'image/gif',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_TIFF = 'image/tiff',
    IMAGE_WEBP = 'image/webp',
}

export enum ALLOWED_AUDIO_TYPES {
    AUDIO_MP3 = 'audio/mp3',
    AUDIO_AAC = 'audio/aac',
    AUDIO_WAV = 'audio/wav',
    AUDIO_M4A = 'audio/m4a',
}

export enum ALLOWED_DOCUMENT_TYPES {
    APPLICATION_PDF = 'application/pdf',
    APPLICATION_MSWORD = 'application/msword',
}

export type ALLOWED_FILE_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_AUDIO_TYPES | ALLOWED_DOCUMENT_TYPES 
export default FileProcessor;
