import crypto from 'crypto';
import { IFile } from './base';
import { Types } from 'mongoose';
import FileProcessor from '../config/file_processors';
import { IComment, IPost } from './feed';
import { INotification, NOTIFICATION_TYPE_CHOICES } from './profiles';
import { IUser } from './accounts';

// Helper function to generate a random alphanumeric string
const randomStringGenerator = (length: number):string => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const getFileUrl = (file: IFile | Types.ObjectId | null, folder: string): string | null => {
    let url: string | null = null
    if (file) {
        file = file as IFile
        url = FileProcessor.generateFileUrl(file._id.toString(), folder, file.resourceType)
    }
    return url;
}

const getNotificationMessage = (obj: INotification): string => {
    // This function returns a notification message
    const nType = obj.nType
    const sender = (obj.sender as IUser)?.name
    let message = `${sender} reacted to your post`
    if (nType === NOTIFICATION_TYPE_CHOICES.REACTION) {
        if ( obj.comment !== null ) message = `${sender} reacted to your comment`
        else if ( obj.reply !== null ) message = `${sender} reacted to your reply`
    } else if (nType === NOTIFICATION_TYPE_CHOICES.COMMENT) {
        message = `${sender} commented on your post`
    } else if (nType === NOTIFICATION_TYPE_CHOICES.REPLY) message = `${sender} replied your comment`
    return message
}

export { randomStringGenerator, getFileUrl, getNotificationMessage }