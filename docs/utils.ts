import 'reflect-metadata';
import { plainToClass } from 'class-transformer';

function generateSwaggerExample<T extends object>(cls: new () => T): Record<string, any> {
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

export { generateSwaggerExample }
