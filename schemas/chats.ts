import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, FILE_TYPE_EXAMPLE, FileUploadDataSchema, ID_EXAMPLE, IMAGE_EXAMPLE, PaginatedResponseSchema, UserSchema } from "./base";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { CHAT_TYPE_CHOICES } from "../models/chat";
import { IsEnum, IsOptional } from "class-validator";
import { ALLOWED_FILE_TYPES } from "../config/file_processors";

export class LatestMessageSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(UserSchema))
    sender?: UserSchema;

    @Expose()
    @Example("God is good")
    text?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    fileUrl?: string;
}

export class ChatSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;
    
    @Expose()
    @Example("My Group")
    name?: string;
    
    @Expose()
    @Example(generateSwaggerExampleFromSchema(UserSchema))
    owner?: UserSchema;
    
    @Expose()
    @Example(CHAT_TYPE_CHOICES.DM)
    cType?: CHAT_TYPE_CHOICES;

    @Example("This is a good group of mine")
    @Expose()
    description?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    imageUrl?: string;

    @Example(generateSwaggerExampleFromSchema(LatestMessageSchema))
    @Expose()
    latestMessage?: LatestMessageSchema;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    updatedAt?: Date;
}

export class MessageSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;

    @Expose()
    @Example(ID_EXAMPLE)
    chatId?: string;
    
    @Expose()
    @Example(generateSwaggerExampleFromSchema(UserSchema))
    sender?: UserSchema;

    @Expose()
    @Example("God is Good")
    text?: string;
    
    @Example(IMAGE_EXAMPLE)
    @Expose()
    fileUrl?: string;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    updatedAt?: Date;
}

export class ChatsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Example([generateSwaggerExampleFromSchema(ChatSchema)])
    @Type(() => ChatSchema)
    chats?: ChatSchema[]
}


export class SendMessageSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    @IsOptional()
    chatId?: string;
    
    @Expose()
    @Example("john-doe")
    @IsOptional()
    username?: string;
    
    @Expose()
    @Example("Kenechi is the best")
    @IsOptional()
    text?: string;

    @Example(FILE_TYPE_EXAMPLE)
    @Expose()
    @IsEnum(ALLOWED_FILE_TYPES)
    @IsOptional()
    fileType?: string;
}

export class MessageSentResponseSchema extends MessageSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(FileUploadDataSchema))
    fileUploadData?: FileUploadDataSchema;
}

export class MessagesDataSchema extends PaginatedResponseSchema {
    @Expose()
    @Example([generateSwaggerExampleFromSchema(MessageSchema)])
    @Type(() => MessageSchema)
    items?: MessageSchema[];
}

export class MessagesResponseSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(ChatSchema))
    chat?: ChatSchema;

    @Expose()
    @Example(generateSwaggerExampleFromSchema(MessagesDataSchema))
    messages?: MessagesDataSchema;

    @Expose()
    @Example([generateSwaggerExampleFromSchema(UserSchema)])
    @Type(() => UserSchema)
    users?: UserSchema[];
}