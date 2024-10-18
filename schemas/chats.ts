import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, FILE_TYPE_EXAMPLE, FileUploadDataSchema, ID_EXAMPLE, IMAGE_EXAMPLE, PaginatedResponseSchema, UserSchema } from "./base";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { CHAT_TYPE_CHOICES } from "../models/chat";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
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
    @Type(() => String)
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    @Type(() => String)
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
    @Type(() => String)
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    @Type(() => String)
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

export class GroupCreateSchema {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @Expose()
    @Example("Best Group")
    name?: string;

    @IsString()
    @IsOptional()
    @Length(3, 500)
    @Expose()
    @Example("This is the best group you'll ever come across")
    description?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(99)
    @IsString({ each: true })
    @Expose()    
    @Example(["john-doe"])
    usernamesToAdd?: string[];
    
    @Example(FILE_TYPE_EXAMPLE)
    @Expose()
    @IsEnum(ALLOWED_FILE_TYPES)
    @IsOptional()
    fileType?: string;
}

export class GroupUpdateSchema {
    @IsString()
    @IsOptional()
    @Length(3, 50)
    @Expose()
    @Example("Best Group")
    name?: string;

    @IsString()
    @IsOptional()
    @Length(3, 500)
    @Expose()
    @Example("This is the best group you'll ever come across")
    description?: string;

    @IsArray()
    @IsOptional()
    @ArrayMinSize(1)
    @ArrayMaxSize(99)
    @IsString({ each: true })
    @Expose()    
    @Example(["john-doe"])
    usernamesToAdd?: string[];

    @IsArray()
    @IsOptional()
    @ArrayMinSize(1)
    @ArrayMaxSize(99)
    @IsString({ each: true })
    @Expose()    
    @Example(["john-doe"])
    usernamesToRemove?: string[];
    
    @Example(FILE_TYPE_EXAMPLE)
    @Expose()
    @IsEnum(ALLOWED_FILE_TYPES)
    @IsOptional()
    fileType?: string;
}

export class GroupChatSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;

    @Expose()
    @Example("My Group")
    name?: string;
    
    @Example("This is a good group of mine")
    @Expose()
    description?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    imageUrl?: string;

    @Expose()
    @Example([generateSwaggerExampleFromSchema(UserSchema)])
    @Type(() => UserSchema)
    users?: UserSchema[];

    @Example(DATETIME_EXAMPLE)
    @Expose()
    @Type(() => String)
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    @Type(() => String)
    updatedAt?: Date;
}

export class GroupChatInputResponseSchema extends GroupChatSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(FileUploadDataSchema))
    fileUploadData?: FileUploadDataSchema;
}

export class UpdateMessageSchema {
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
