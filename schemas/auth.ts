import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class RegisterSchema {
    @Example('John')
    @Expose()
    @Length(3, 50)
    firstName?: string;

    @Example('Doe')
    @Expose()
    @Length(3, 50)
    lastName?: string;

    @Example('johndoe@example.com')
    @Expose()
    @IsEmail({}, {message: "Enter a valid email address"})
    email?: string;

    @Example('strongpassword')
    @Expose()
    @Length(8, 50)
    password?: string;

    @Example(true)
    @Expose()
    termsAgreement?: boolean;
}