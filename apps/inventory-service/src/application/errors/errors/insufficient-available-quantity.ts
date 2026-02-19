import { UseCaseError } from '../use-case-error';

export class InsufficientAvailableQuantityError extends Error implements UseCaseError {
  constructor(
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(
      `Insufficient available quantity. Available: ${available}, requested: ${requested}`,
    );
    this.name = 'InsufficientAvailableQuantityError';
  }
}
