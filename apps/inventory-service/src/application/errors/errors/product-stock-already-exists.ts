import { UseCaseError } from '../use-case-error';

export class ProductStockAlreadyExistsError extends Error implements UseCaseError {
  constructor(productId: string) {
    super(`Product stock already exists for product: ${productId}`);
    this.name = 'ProductStockAlreadyExistsError';
  }
}
