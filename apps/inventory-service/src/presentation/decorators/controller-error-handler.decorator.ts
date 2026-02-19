import {
  HttpConflictError,
  HttpInternalServerError,
  HttpNotFoundError,
  HttpUnprocessableEntityError,
} from '@/presentation/helpers';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export function ControllerErrorHandlerDecorator() {
  return (target: any, _: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (
          error instanceof Error &&
          ['ProductStockNotFoundError', 'ProductNotFoundError'].includes(
            error.name,
          )
        ) {
          throw new NotFoundException(HttpNotFoundError(error));
        }

        if (error instanceof Error && error.name === 'ProductStockAlreadyExistsError') {
          throw new ConflictException(HttpConflictError(error));
        }

        if (
          error instanceof Error &&
          [
            'InvalidQuantityError',
            'InsufficientAvailableQuantityError',
            'InsufficientReservedQuantityError',
          ].includes(error.name)
        ) {
          throw new UnprocessableEntityException(HttpUnprocessableEntityError(error));
        }

        throw new InternalServerErrorException(
          HttpInternalServerError(error instanceof Error ? error.message : String(error)),
        );
      }
    };
  };
}
