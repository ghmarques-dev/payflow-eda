import { UseCaseError } from '../use-case-error';

export class InvalidDiscountError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message);
  }
}
