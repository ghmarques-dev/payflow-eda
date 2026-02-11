import { Module } from '@nestjs/common';

import { EventPublisher } from '@/application/ports';
import { EnvModule } from '@/infra/env';

import { RabbitMqEventPublisher } from './rabbitmq-event-publisher';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: EventPublisher,
      useClass: RabbitMqEventPublisher,
    },
  ],
  exports: [EventPublisher],
})
export class MessagingModule {}
