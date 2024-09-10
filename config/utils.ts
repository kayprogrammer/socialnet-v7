import { plainToInstance } from "class-transformer";
import snakecaseKeys from 'snakecase-keys';

type ResponseBase = {
  message: string;
  status: string;
  code?: string; // Optional error code
};

export class CustomResponse {
  static success<T, U, V extends T | undefined>(
    message: string,
    data?: U | U[],
    dataSchema?: new () => V
  ): ResponseBase & { data?: T } {
    let response: ResponseBase & { data?: T } = {
      message,
      status: "success"
    };

    if (dataSchema && data !== undefined) {
      response.data = plainToInstance(dataSchema, data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }) as T; // Type assertion to ensure compatibility
    } else {
      response.data = data as T;
    }

    // Convert response keys to snake_case
    const snakeCasedResponse: ResponseBase & { data?: T } = snakecaseKeys(response) as ResponseBase & { data?: T };

    return snakeCasedResponse;
  }

  static error(message: string, code: string): ResponseBase {
    return {
      message,
      status: "failure",
      code
    };
  }
}
