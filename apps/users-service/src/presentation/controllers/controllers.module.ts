import { Module } from '@nestjs/common';

import { UsersController } from '.';

import { 
  SignUpUseCase, 
  SignInUseCase, 
  RefreshTokenUseCase 
} from '@/application/use-cases';

import { AuthModule } from '@/infra/auth';
import { DatabaseModule } from '@/infra/database';
import { CryptographyModule } from '@/infra/cryptography';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    CryptographyModule,
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    SignUpUseCase,
    SignInUseCase,
    RefreshTokenUseCase,
  ],
})
export class ControllersModule {}
