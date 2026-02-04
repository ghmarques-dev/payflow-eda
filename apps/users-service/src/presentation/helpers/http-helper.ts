import { HttpStatus } from '@nestjs/common';

import { HttpResponse } from '@/presentation/protocols';

export const HttpSuccessResponse = (data: any): HttpResponse => {
  return {
    status: HttpStatus.OK,
    data,
  };
};

export const HttpCreatedResponse = (data: any): HttpResponse => {
  return {
    status: HttpStatus.CREATED,
    data,
  };
};

export const HttpUnauthorizedError = (error: Error): HttpResponse => {
  return {
    status: HttpStatus.UNAUTHORIZED,
    error: {
      code: error.name,
      message: error.message,
    },
  };
};

export const HttpForbiddenError = (error: Error): HttpResponse => {
  return {
    status: HttpStatus.FORBIDDEN,
    error: {
      code: error.name,
      message: error.message,
    },
  };
};

export const HttpNotFoundError = (error: Error): HttpResponse => {
  return {
    status: HttpStatus.NOT_FOUND,
    error: {
      code: error.name,
      message: error.message,
    },
  };
};

export const HttpConflictError = (error: Error): HttpResponse => {
  return {
    status: HttpStatus.CONFLICT,
    error: {
      code: error.name,
      message: error.message,
    },
  };
};

export const HttpUnprocessableEntityError = (error: Error): HttpResponse => {
  return {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    error: {
      code: error.name,
      message: error.message,
    },
  };
};

export const HttpInternalServerError = (details: string): HttpResponse => {
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    error: {
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
      details,
    },
  };
};
