import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail, IsNotEmpty, IsNumber, Length, Max, Min } from "class-validator";
import { EmailSchema } from "./base";

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

export class VerifyEmailSchema extends EmailSchema {
    @Example(123456)
    @Expose()
    @Min(100000)
    @Max(999999)
    @IsNumber()
    otp?: number;
}