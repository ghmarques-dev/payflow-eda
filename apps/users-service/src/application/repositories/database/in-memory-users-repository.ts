import { randomUUID } from 'node:crypto';

import { User } from '@/domain/entities';
import { UsersRepository } from '@/domain/repositories';

export class InMemoryUsersRepository implements UsersRepository {
  private users: User[] = [];

  async create(
    input: UsersRepository.Create.Input,
  ): Promise<UsersRepository.Create.Output> {
    const user: User = {
      user_id: input.user_id || randomUUID(),
      name: input.name,
      email: input.email,
      password: input.password,
      refresh_token: input.refresh_token,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.users.push(user);

    return user;
  }

  async delete(
    input: UsersRepository.Delete.Input,
  ): Promise<UsersRepository.Delete.Output> {
    this.users = this.users.filter((user) => !(input.user_id === user.user_id));
  }

  async find_by_email(
    input: UsersRepository.FindByEmail.Input,
  ): Promise<UsersRepository.FindByEmail.Output> {
    const user = this.users.find((user) => user.email === input.email);

    return user || null;
  }

  async find_by_id(
    input: UsersRepository.FindById.Input,
  ): Promise<UsersRepository.FindById.Output> {
    const user = this.users.find((user) => user.user_id === input.userId);

    return user || null;
  }

  async find_by_refresh_token(
    input: UsersRepository.FindByRefreshToken.Input,
  ): Promise<UsersRepository.FindByRefreshToken.Output> {
    const user = this.users.find((user) => user.refresh_token === input.refresh_token);

    return user || null;
  }

  async update(
    input: UsersRepository.Update.Input,
  ): Promise<UsersRepository.Update.Output> {
    const user = this.users.find((user) => user.user_id === input.user_id)!;

    user.name = input.name || user.name;
    user.email = input.email || user.email;
    user.password = input.password || user.password;

    return user;
  }
}
