import crypto from 'crypto'; // Import crypto for generating random strings
import { File, IFile } from './base';
import { Types } from 'mongoose';
import FileProcessor from '../config/file_processors';

// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length: number):string => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const getFileUrl = (file: IFile | Types.ObjectId | undefined, folder: string): string | null => {
    let url: string | null = null
    if (file) {
        file = file as IFile
        url = FileProcessor.generateFileUrl(file._id.toString(), folder, file.resourceType)
    }
    return url;
}
export { randomStringGenerator, getFileUrl }