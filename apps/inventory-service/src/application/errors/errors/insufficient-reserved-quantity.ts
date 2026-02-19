import { UseCaseError } from '../use-case-error';

export class InsufficientReservedQuantityError extends Error implements UseCaseError {
  constructor(
    public readonly reserved: number,
    public readonly requested: number,
  ) {
    super(
      `Insufficient reserved quantity. Reserved: ${reserved}, requested: ${requested}`,
    );
    this.name = 'InsufficientReservedQuantityError';
  }
}
