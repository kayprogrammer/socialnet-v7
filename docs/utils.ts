import 'reflect-metadata';
import { plainToClass } from 'class-transformer';

function generateSwaggerCreateExamples<T extends object>(cls: new () => T): Record<string, any> {
    const properties: Record<string, any> = {};
    
    const instance = plainToClass(cls, {}) as T;
  
    const keys = Object.keys(instance);
  
    keys.forEach((key) => {
      const type = Reflect.getMetadata('design:type', instance, key);
      properties[key] = { type: type.name.toLowerCase() };
    });
  
    return properties;
}

function generateSwaggerResponseExamples<T extends object>(cls: new () => T): Record<string, any> {
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

export { generateSwaggerCreateExamples, generateSwaggerResponseExamples }
