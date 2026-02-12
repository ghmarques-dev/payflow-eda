import { UseCaseError } from '../use-case-error';

export class SaleWithoutItemsError extends Error implements UseCaseError {
  constructor() {
    super('Sale must have at least one item');
  }
}
