import 'reflect-metadata';
import { plainToClass } from 'class-transformer';

function generateSwaggerExampleFromSchema<T extends object>(cls: new () => T): Record<string, any> {
    const examples: Record<string, any> = {};
    
    const instance = plainToClass(cls, {}) as T;
  
    const keys = Object.keys(instance);
  
    keys.forEach((key) => {
      const example = Reflect.getMetadata('example', instance, key);
      if (example !== undefined) {
        examples[key] = example;
      }
    });
  
    return examples
}

function generateSwaggerRequestExample<T extends object>(summary: string, schemaClass: new () => T, contentType: string = "application/json"): Record<string, any> {
  return { 
    content: {
        [contentType]: {
            examples: {
                example1: {
                  summary: summary + " body example",
                  value: generateSwaggerExampleFromSchema(schemaClass)
                }
            }
        },
    },
    required: true
  }
}

function generateSwaggerExampleValue<T extends object>(summary: string, status: string, message: string, schemaClass?: (new () => T) | null, code?: string): Record<string, any> {
  let responseValue = {
    status: status,
    message: message,
    ...(code && { code: code }),
    ...(schemaClass && { data: generateSwaggerExampleFromSchema(schemaClass as new () => T) })
  }
  return {
    summary: summary,
    value: responseValue,
  }
}

function generateSwaggerResponseExample<T extends object>(description: string, status: string, message: string, schemaClass?: (new () => T) | null, code?: string): Record<string, any> {
  
  return {
    description: description,
    content: {
      'application/json': {
          examples: {
              example1: generateSwaggerExampleValue("An example response", status, message, schemaClass, code),
          },
      },
    },
  }
}

export { generateSwaggerRequestExample, generateSwaggerResponseExample, generateSwaggerExampleValue }
