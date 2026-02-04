import { UseCaseError } from '../use-case-error'

export class UserIsNotLoggedInError extends Error implements UseCaseError {
  constructor() {
    super('User is not logged in');
  }
}
