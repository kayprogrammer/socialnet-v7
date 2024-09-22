import { Expose } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, IMAGE_EXAMPLE, UserSchema, UUID_EXAMPLE } from "./base";

export class PostSchema {
    @Expose()
    author?: UserSchema;
    
    @Example('Jesus is Lord')
    @Expose()
    text?: string;

    @Example(`john-doe-${UUID_EXAMPLE}`)
    @Expose()
    slug?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    image?: string;

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