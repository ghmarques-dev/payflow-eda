import { User } from '@/domain/entities'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    }
  }
}