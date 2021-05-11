import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    let obj = plainToClass(metadata.metatype, value);
    if (metadata.type === 'param') {
      obj = { obj };
    }
    if (metadata.type === 'query') {
      return value;
    }
    const errors = await validate(obj, {});
    if (errors.length) {
      const messages = errors.map((err) => {
        return `${err.property} - ${Object.values(err.constraints).join(', ')}`;
      });
      const validErrorsResponse = { message: messages, statusCode: 400 };
      throw new ValidationException(validErrorsResponse);
    }
    return value;
  }
}
