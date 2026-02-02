import { Injectable } from '@nestjs/common';

import { 
  RefreshTokenNotFoundError, 
} from '@/application/errors';

import type { 
  Encrypter, 
  UsersRepository 
} from '@/domain/repositories';

export type IRefreshTokenUseCaseInput = {
  refresh_token: string;
};

export type IRefreshTokenUseCaseOutput = {
  accessToken: string;
  expiresIn: number;
};

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async execute(input: IRefreshTokenUseCaseInput): Promise<IRefreshTokenUseCaseOutput> {
    const user = await this.usersRepository.find_by_refresh_token({
      refresh_token: input.refresh_token,
    });

    if (!user) {
      throw new RefreshTokenNotFoundError();
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
    };

    const accessToken = await this.encrypter.encrypt(payload);

    return {
      accessToken,
      expiresIn: 30 * 60 * 1000, // 30 minutes
    };
  }
}
