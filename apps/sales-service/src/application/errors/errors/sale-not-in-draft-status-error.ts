import { UseCaseError } from '../use-case-error';

export class SaleNotInDraftStatusError extends Error implements UseCaseError {
  constructor() {
    super('Sale is not in draft status');
  }
}
