import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { BcryptAdapter } from './bcrypt-adapter';
import { NestJwtAdapter } from './nest-jwt-adapter';
import { EnvModule, EnvService } from '@/infra/env';
import {
  Decrypter,
  Encrypter,
  HashComparer,
  HashGenerator,
} from '@/domain/repositories';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,

      useFactory(env: EnvService) {
        return {
          signOptions: { expiresIn: 60 * 60 * 24 * 1 }, // 1 day
          secret: env.get('JWT_SECRET'),
        };
      },
    }),
  ],
  providers: [
    EnvService,
    {
      provide: Encrypter,
      useClass: NestJwtAdapter,
    },
    {
      provide: Decrypter,
      useClass: NestJwtAdapter,
    },
    {
      provide: HashComparer,
      useClass: BcryptAdapter,
    },
    {
      provide: HashGenerator,
      useClass: BcryptAdapter,
    },
  ],
  exports: [Encrypter, Decrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
