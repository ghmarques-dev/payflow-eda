import { UseCaseError } from '../use-case-error';

export class InvalidQuantityError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidQuantityError';
  }
}
