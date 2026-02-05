import { Module } from '@nestjs/common';

import { UsersController } from '.';

import {
  SignUpUseCase,
  SignInUseCase,
  RefreshTokenUseCase,
} from '@/application/use-cases';

import { AuthModule } from '@/infra/auth';
import { DatabaseModule } from '@/infra/database';
import { CryptographyModule } from '@/infra/cryptography';
import { MessagingModule } from '@/infra/messaging';
import { EnvService } from '@/infra/env';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    CryptographyModule,
    MessagingModule,
  ],
  controllers: [UsersController],
  providers: [
    EnvService,

    SignUpUseCase,
    SignInUseCase,
    RefreshTokenUseCase,
  ],
})
export class ControllersModule {}
