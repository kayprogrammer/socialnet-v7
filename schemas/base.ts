import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail } from "class-validator";

export class ResponseSchema {
    status: "success" | "failure" = "success";
    message?: string;
}

export class EmailSchema {
    @Expose()
    @Example("johndoe@example.com")
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string
}

export class UnprocessableSchema {
    @Expose()
    @Example("This field is required")
    field1?: string

    @Expose()
    @Example("Ensure this is a valid type")
    field2?: string
}