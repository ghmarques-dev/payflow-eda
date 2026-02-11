import { Injectable, OnModuleDestroy } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

import type { EventPublisher } from '@/application/ports';
import type { DomainEvent } from '@/domain/events';
import { EnvService } from '@/infra/env';

const EXCHANGE_NAME = 'payflow.events';
const MESSAGES_QUEUE_NAME = 'payflow.events.queue';
const EXCHANGE_TYPE = 'topic';

function serializeEvent<T>(event: DomainEvent<T>): Record<string, unknown> {
  const hasToObject =
    typeof (event as { toObject?: () => Record<string, unknown> }).toObject ===
    'function';

  if (hasToObject) {
    return (event as { toObject: () => Record<string, unknown> }).toObject();
  }

  return {
    trace_id: event.trace_id,
    origin: event.origin,
    event_type: event.event_type,
    payload: event.payload,
  };
}

@Injectable()
export class RabbitMqEventPublisher implements EventPublisher, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly env: EnvService) {}

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const channel = await this.getChannel();

    const serialized = serializeEvent(event);

    const routingKey = event.event_type;
    const messageBuffer = Buffer.from(JSON.stringify(serialized), 'utf-8');

    const publishOptions = {
      persistent: true,
      contentType: 'application/json' as const,
      messageId: event.trace_id,
      timestamp: Date.now(),
      headers: {
        origin: event.origin,
        event_type: event.event_type,
      },
    };

    channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, publishOptions);
  }

  private async getChannel(): Promise<Channel> {
    if (this.channel != null) {
      return this.channel;
    }

    const rabbitUrl = this.env.get('RABBITMQ_URL');
    const connection = await amqp.connect(rabbitUrl);

    this.connection = connection;

    const channel = await connection.createChannel();

    this.channel = channel;

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    await channel.assertQueue(MESSAGES_QUEUE_NAME, { durable: true });
    await channel.bindQueue(MESSAGES_QUEUE_NAME, EXCHANGE_NAME, '#');

    return channel;
  }

  private async close(): Promise<void> {
    try {
      if (this.channel != null) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection != null) {
        await this.connection.close();
        this.connection = null;
      }
    } catch {}
  }
}
