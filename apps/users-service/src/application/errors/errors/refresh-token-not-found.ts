import { UseCaseError } from '../use-case-error'

export class RefreshTokenNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Refresh token not found');
  }
}
