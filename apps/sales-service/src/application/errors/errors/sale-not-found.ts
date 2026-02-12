import { UseCaseError } from '../use-case-error';

export class SaleNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Sale not found');
  }
}
