import { UseCaseError } from '../use-case-error';

export class SaleWithInvalidTotalError extends Error implements UseCaseError {
  constructor() {
    super('Sale total must be greater than zero');
  }
}
