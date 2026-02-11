import { Injectable } from '@nestjs/common';

import { User } from '@/domain/entities';
import { PrismaService } from './prisma.service';
import { UsersRepository } from '@/domain/repositories/database';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: UsersRepository.Create.Input,
  ): Promise<UsersRepository.Create.Output> {
    const result = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    });

    const user: User = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      password: result.password,
      refresh_token: result.refresh_token || undefined,
      created_at: result.created_at,
      updated_at: result.created_at,
    };

    return user;
  }

  async find_by_id(
    input: UsersRepository.FindById.Input,
  ): Promise<UsersRepository.FindById.Output> {
    const result = await this.prisma.user.findUnique({
      where: {
        user_id: input.userId,
      },
    });

    if (!result) return null;

    const user: User = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      password: result.password,
      refresh_token: result.refresh_token || undefined,
      created_at: result.created_at,
      updated_at: result.created_at,
    };

    return user;
  }

  async find_by_email(
    input: UsersRepository.FindByEmail.Input,
  ): Promise<UsersRepository.FindByEmail.Output> {
    const result = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!result) return null;

    const user: User = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      password: result.password,
      refresh_token: result.refresh_token || undefined,
      created_at: result.created_at,
      updated_at: result.created_at,
    };

    return user;
  }

  async find_by_refresh_token(
    input: UsersRepository.FindByRefreshToken.Input,
  ): Promise<UsersRepository.FindByRefreshToken.Output> {
    const result = await this.prisma.user.findFirst({
      where: {
        refresh_token: input.refresh_token,
      },
    });

    if (!result) return null;

    const user: User = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      password: result.password,
      refresh_token: result.refresh_token || undefined,
      created_at: result.created_at,
      updated_at: result.created_at,
    };

    return user;
  }

  async update(
    input: UsersRepository.Update.Input,
  ): Promise<UsersRepository.Update.Output> {
    const result = await this.prisma.user.update({
      where: {
        user_id: input.user_id,
      },
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
        refresh_token: input.refresh_token,
      },
    });

    if (!result) return null;

    const user: User = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      password: result.password,
      refresh_token: result.refresh_token || undefined,
      created_at: result.created_at,
      updated_at: result.created_at,
    };

    return user;
  }

  async delete(
    input: UsersRepository.Delete.Input,
  ): Promise<UsersRepository.Delete.Output> {
    await this.prisma.user.delete({
      where: {
        user_id: input.user_id,
      },
    });
  }
}
