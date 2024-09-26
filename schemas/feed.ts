import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, FileUploadDataSchema, IMAGE_EXAMPLE, PaginatedResponseSchema, UserSchema, UUID_EXAMPLE } from "./base";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import FileProcessor, { ALLOWED_IMAGE_TYPES } from "../config/file_processors";
import { IFile } from "../models/base";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { Types } from "mongoose";
import { IComment } from "../models/feed";

export class PostSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(UserSchema))
    author?: UserSchema;
    
    @Example('Jesus is Lord')
    @Expose()
    text?: string;

    @Example(`john-doe-${UUID_EXAMPLE}`)
    @Expose()
    slug?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    imageUrl?: string;

    @Example(10)
    @Expose()
    reactionsCount?: number;

    @Example(10)
    @Expose()
    commentsCount?: number;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    createdAt?: string;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    updatedAt?: string;
}

export class PostCreateSchema {
    @Example("Jesus is Lord")
    @Expose()
    @IsNotEmpty()
    text?: string

    @Example("image/png")
    @Expose()
    @IsOptional()
    @IsEnum(ALLOWED_IMAGE_TYPES)
    fileType?: string
}

export class PostsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => PostSchema)
    @Example([generateSwaggerExampleFromSchema(PostSchema)])
    posts?: PostSchema[]
}

export class PostCreateResponseSchema extends PostSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(FileUploadDataSchema))
    fileUploadData?: FileUploadDataSchema;
}

