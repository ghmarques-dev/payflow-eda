import { Injectable, OnModuleDestroy } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

import type { EventPublisher } from '@/application/ports';
import type { DomainEvent } from '@payflow/contracts';
import {
  RABBITMQ_DLQ_QUEUE,
  RABBITMQ_DLX_EXCHANGE,
  RABBITMQ_DLX_ROUTING_KEY,
  RABBITMQ_EXCHANGE_NAME,
  RABBITMQ_EXCHANGE_TYPE,
  RABBITMQ_MAIN_QUEUE,
} from '@payflow/contracts';
import { EnvService } from '@/infra/env';
import { injectTraceContext, SpanStatusCode, trace } from '@payflow/telemetry';

function serializeEvent<T>(event: DomainEvent<T>): Record<string, unknown> {
  const hasToObject =
    typeof (event as { toObject?: () => Record<string, unknown> }).toObject ===
    'function';

  if (hasToObject) {
    return (
      event as unknown as { toObject: () => Record<string, unknown> }
    ).toObject();
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

  async publish<T>({
    event,
    routing_key,
  }: EventPublisher.Publish.Input<T>): Promise<void> {
    const channel = await this.getChannel();

    const serialized = serializeEvent(event);

    const routingKey = routing_key;
    const messageBuffer = Buffer.from(JSON.stringify(serialized), 'utf-8');

    const tracer = trace.getTracer('payflow.sales.messaging');
    const headers = injectTraceContext({
      origin: event.origin,
      event_type: event.event_type,
    });

    await tracer.startActiveSpan(
      'rabbitmq.publish',
      {
        attributes: {
          'messaging.system': 'rabbitmq',
          'messaging.destination.name': routingKey,
          'messaging.message_id': event.trace_id,
        },
      },
      async (span) => {
        const publishOptions = {
          persistent: true,
          contentType: 'application/json',
          messageId: event.trace_id,
          timestamp: Date.now(),
          headers,
        };

        channel.publish(
          RABBITMQ_EXCHANGE_NAME,
          routingKey,
          messageBuffer,
          publishOptions,
        );
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      },
    );
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

    await channel.assertExchange(
      RABBITMQ_EXCHANGE_NAME,
      RABBITMQ_EXCHANGE_TYPE,
      {
        durable: true,
      },
    );

    await channel.assertExchange(RABBITMQ_DLX_EXCHANGE, 'direct', {
      durable: true,
    });

    await channel.assertQueue(RABBITMQ_MAIN_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ_DLX_EXCHANGE,
        'x-dead-letter-routing-key': RABBITMQ_DLX_ROUTING_KEY,
      },
    });
    await channel.bindQueue(RABBITMQ_MAIN_QUEUE, RABBITMQ_EXCHANGE_NAME, '#');

    await channel.assertQueue(RABBITMQ_DLQ_QUEUE, { durable: true });
    await channel.bindQueue(
      RABBITMQ_DLQ_QUEUE,
      RABBITMQ_DLX_EXCHANGE,
      RABBITMQ_DLX_ROUTING_KEY,
    );

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
