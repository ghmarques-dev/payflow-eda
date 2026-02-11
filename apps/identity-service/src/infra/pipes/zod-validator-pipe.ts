import { ZodError, ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          status: 400,
          error: {
            code: error.name,
            message: fromZodError(error),
          },
        });
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
