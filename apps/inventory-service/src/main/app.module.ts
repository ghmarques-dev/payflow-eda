import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { ControllersModule } from '@/presentation/controllers';

import { EnvModule, envSchema } from '@/infra/env';
import { SubscriberModule } from '@/infra/subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    ControllersModule,
    SubscriberModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
