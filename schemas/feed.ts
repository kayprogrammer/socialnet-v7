import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, FileUploadDataSchema, IMAGE_EXAMPLE, PaginatedResponseSchema, UserSchema, UUID_EXAMPLE } from "./base";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ALLOWED_IMAGE_TYPES } from "../config/file_processors";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { REACTION_CHOICES_ENUM } from "../models/feed";

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
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    updatedAt?: Date;
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

export class ReactionSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(UserSchema))
    user?: UserSchema;

    @Expose()
    @Example(REACTION_CHOICES_ENUM.LIKE)
    rType?: string
}

export class ReactionCreateSchema {
    @Expose()
    @Example(REACTION_CHOICES_ENUM.LIKE)
    @IsEnum(REACTION_CHOICES_ENUM)
    rType?: string
}
export class ReactionsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => ReactionSchema)
    @Example([generateSwaggerExampleFromSchema(ReactionSchema)])
    reactions?: ReactionSchema[]
}