import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EnvModule, EnvService } from '@/infra/env';

import { AuthGuard } from './auth.guard';

@Module({
  imports: [EnvModule],
  providers: [
    EnvService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [EnvService],
})
export class AuthModule {}
