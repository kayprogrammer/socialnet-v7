import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { DATETIME_EXAMPLE, FILE_TYPE_EXAMPLE, FileUploadDataSchema, ID_EXAMPLE, IMAGE_EXAMPLE, PaginatedResponseSchema, UserSchema } from "./base";
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, Length } from "class-validator";
import { ALLOWED_IMAGE_TYPES } from "../config/file_processors";
import { generateSwaggerExampleFromSchema } from "../docs/utils";

export class ProfileSchema {
    @Expose()
    @Example("John")
    firstName?: string;
    
    @Expose()
    @Example("Doe")
    lastName?: string;
    
    @Expose()
    @Example("john-doe")
    username?: string;
    
    @Expose()
    @Example("johndoe@example.com")
    email?: string;

    @Example(IMAGE_EXAMPLE)
    @Expose()
    avatarUrl?: string;

    @Example("Kenechi Ifeanyi is the best backend engineer for your projects")
    @Expose()
    bio?: string;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    dob?: Date;

    @Example("Lagos")
    @Expose()
    city?: string;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    createdAt?: Date;

    @Example(DATETIME_EXAMPLE)
    @Expose()
    updatedAt?: Date;
}

export class ProfilesResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Example([generateSwaggerExampleFromSchema(ProfileSchema)])
    @Type(() => ProfileSchema)
    users?: ProfileSchema[]
}
export class ProfileEditSchema {
    @Example("John")
    @Expose()
    @Length(3, 50)
    @IsOptional()
    firstName?: string;
    
    @Example("Doe")
    @Expose()
    @Length(3, 50)
    @IsOptional()
    lastName?: string;
    
    @Example('Software Engineer | Backend Engineer')
    @Expose()
    bio?: string;
    
    @Example(DATETIME_EXAMPLE)
    @Expose()
    @IsDateString()
    @IsOptional()
    dob?: Date;
    
    @Example(ID_EXAMPLE)
    @Expose()
    cityId?: string;

    @Example(FILE_TYPE_EXAMPLE)
    @Expose()
    @IsEnum(ALLOWED_IMAGE_TYPES)
    @IsOptional()
    fileType?: string;

    city_?: string;
    avatar?: string;
}

export class ProfileEditResponseSchema extends ProfileSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(FileUploadDataSchema))
    fileUploadData?: FileUploadDataSchema;
}


export class CitySchema {
    @Example(ID_EXAMPLE)
    @Expose()
    id?: string
    
    @Example("Ikeja")
    @Expose()
    name?: string
    
    @Example("Lagos")
    @Expose()
    state?: string
    
    @Example("Nigeria")
    @Expose()
    country?: string
}

export class DeleteUserSchema {
    @Expose()
    @Example("password")
    password?: string;
}

export class SendFriendRequestSchema {
    @Expose()
    @IsNotEmpty()
    @Example("john-doe")
    username?: string;
}

export class AcceptFriendRequestSchema extends SendFriendRequestSchema {
    @Expose()
    @IsBoolean()
    @Example(true)
    accepted?: boolean;
}