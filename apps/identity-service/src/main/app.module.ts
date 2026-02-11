import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { ControllersModule } from '@/presentation/controllers';

import { EnvModule, envSchema } from '@/infra/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    ControllersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
