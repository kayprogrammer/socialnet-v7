export class ResponseSchema {
    status: "success" | "failure" = "success";
    message?: string;
}