import { Expose } from "class-transformer";

export class ResponseSchema {
    status: "success" | "failure" = "success";
    message?: string;
}

export class EmailSchema {
    @Expose()
    email?: string
}