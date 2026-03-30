import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

import type { EventSubscriber } from '@/domain/services';
import type { DomainEvent } from '@payflow/contracts';
import {
  RABBITMQ_DLQ_QUEUE,
  RABBITMQ_DLX_EXCHANGE,
  RABBITMQ_DLX_ROUTING_KEY,
  RABBITMQ_EXCHANGE_NAME,
  RABBITMQ_EXCHANGE_TYPE,
  RABBITMQ_MAIN_QUEUE,
  RABBITMQ_MAX_RETRIES,
  RABBITMQ_RETRY_HEADER,
} from '@payflow/contracts';
import { EnvService } from '@/infra/env';
import {
  context,
  extractContextFromHeaders,
  SpanStatusCode,
  trace,
} from '@payflow/telemetry';

function readRetryCount(headers: ConsumeMessage['properties']['headers']): number {
  const raw = headers?.[RABBITMQ_RETRY_HEADER];

  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const number = Number.parseInt(raw, 10);
    return Number.isNaN(number) ? 0 : number;
  }
  return 0;
}

@Injectable()
export class RabbitMQEventSubscriber implements EventSubscriber, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQEventSubscriber.name);

  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly env: EnvService) {}

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async subscribe(input: EventSubscriber.Subscribe.Input): Promise<void> {
    const channel = await this.getChannel();

    await channel.bindQueue(RABBITMQ_MAIN_QUEUE, RABBITMQ_EXCHANGE_NAME, input.routing_key);

    await channel.consume(
      RABBITMQ_MAIN_QUEUE,
      async (msg) => {
        if (!msg) return;

        const parentContext = extractContextFromHeaders(
          msg.properties.headers as Record<string, unknown> | undefined,
        );

        await context.with(parentContext, async () => {
          const messagingTracer = trace.getTracer('payflow.inventory.messaging');

          await messagingTracer.startActiveSpan(
            'rabbitmq.consume',
            {
              attributes: {
                'messaging.system': 'rabbitmq',
                'messaging.destination.name': msg.fields.routingKey,
                'messaging.operation': 'process',
              },
            },
            async (span) => {
              try {
                const content = JSON.parse(msg.content.toString()) as DomainEvent;
                span.setAttribute('payflow.event_type', content.event_type);
                await input.handler(content.payload);
                span.setStatus({ code: SpanStatusCode.OK });
                channel.ack(msg);
              } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                this.logger.warn(
                  `Handler failed (routingKey=${msg.fields.routingKey}): ${error.message}`,
                );
                await this.handleFailure(channel, msg);
              }
            },
          );
        });
      },
      { noAck: false },
    );
  }

  private async handleFailure(channel: Channel, msg: ConsumeMessage): Promise<void> {
    const retryCount = readRetryCount(msg.properties.headers);

    if (retryCount < RABBITMQ_MAX_RETRIES) {
      const next = retryCount + 1;
      this.logger.debug(
        `Republishing message (retry ${next}/${RABBITMQ_MAX_RETRIES}, routingKey=${msg.fields.routingKey})`,
      );

      channel.publish(
        RABBITMQ_EXCHANGE_NAME,
        msg.fields.routingKey,
        msg.content,
        {
          persistent: true,
          contentType: msg.properties.contentType ?? 'application/json',
          messageId: msg.properties.messageId,
          timestamp: msg.properties.timestamp,
          headers: {
            ...(msg.properties.headers ?? {}),
            [RABBITMQ_RETRY_HEADER]: next,
          },
        },
      );
      channel.ack(msg);
      return;
    }

    this.logger.error(
      `Max retries exceeded — sending to DLQ (${RABBITMQ_DLQ_QUEUE}), routingKey=${msg.fields.routingKey}`,
    );
    channel.nack(msg, false, false);
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

    channel.prefetch(1);

    await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, RABBITMQ_EXCHANGE_TYPE, {
      durable: true,
    });

    await channel.assertExchange(RABBITMQ_DLX_EXCHANGE, 'direct', { durable: true });

    await channel.assertQueue(RABBITMQ_MAIN_QUEUE, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ_DLX_EXCHANGE,
        'x-dead-letter-routing-key': RABBITMQ_DLX_ROUTING_KEY,
      },
    });

    await channel.assertQueue(RABBITMQ_DLQ_QUEUE, { durable: true });
    await channel.bindQueue(RABBITMQ_DLQ_QUEUE, RABBITMQ_DLX_EXCHANGE, RABBITMQ_DLX_ROUTING_KEY);

    return channel;
  }

  private async close(): Promise<void> {
    if (this.channel != null) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection != null) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
