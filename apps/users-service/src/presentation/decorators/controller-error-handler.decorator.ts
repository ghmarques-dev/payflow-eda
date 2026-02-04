import {
  HttpConflictError,
  HttpInternalServerError,
  HttpNotFoundError,
  HttpUnauthorizedError,
} from '@/presentation/helpers';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function ControllerErrorHandlerDecorator() {
  return (target: any, _: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (
          ['InvalidCredentialsError'].includes(error.name)
        ) {
          throw new UnauthorizedException(HttpUnauthorizedError(error));
        }

        if (
          ['UserNotFoundError', 'RefreshTokenNotFoundError'].includes(error.name)
        ) {
          throw new NotFoundException(HttpNotFoundError(error));
        }

        if (['UserAlreadyExistsError'].includes(error.name)) {
          throw new ConflictException(HttpConflictError(error));
        }

        throw new InternalServerErrorException(
          HttpInternalServerError(error.message),
        );
      }
    };
  };
}
