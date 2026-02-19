import { UseCaseError } from '../use-case-error';

export class ProductNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Product not found');
    this.name = 'ProductNotFoundError';
  }
}
