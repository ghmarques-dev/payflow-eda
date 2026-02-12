import { UseCaseError } from '../use-case-error';

export class SaleItemNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Sale item not found');
  }
}
