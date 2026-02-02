import { Injectable } from '@nestjs/common';

import {
  UserNotFoundError,
  InvalidCredentialsError,
} from '@/application/errors';
import type { EventPublisher } from '@/application/ports';
import type {
  Encrypter,
  HashComparer,
  UsersRepository,
} from '@/domain/repositories';
import { UserAuthenticatedEvent } from '@/domain/events';

export type ISignInUseCaseInput = {
  email: string;
  password: string;
};

export type ISignInUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class SignInUseCase {
  constructor(
    private readonly hashComparer: HashComparer,
    private readonly usersRepository: UsersRepository,
    private readonly encrypter: Encrypter,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: ISignInUseCaseInput): Promise<ISignInUseCaseOutput> {
    const user = await this.usersRepository.find_by_email({
      email: input.email,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordValid = await this.hashComparer.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.encrypter.encrypt(payload),
      this.encrypter.encrypt(payload),
    ]);

    await this.usersRepository.update({
      user_id: user.user_id,
      refresh_token: refreshToken,
    });

    await this.eventPublisher.publish(
      new UserAuthenticatedEvent({
        user_id: user.user_id,
        email: user.email,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 30 * 60 * 1000, // 30 minutes
    };
  }
}
