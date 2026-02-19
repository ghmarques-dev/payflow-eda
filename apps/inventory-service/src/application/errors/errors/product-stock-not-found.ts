import { UseCaseError } from '../use-case-error';

export class ProductStockNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Product stock not found');
    this.name = 'ProductStockNotFoundError';
  }
}
