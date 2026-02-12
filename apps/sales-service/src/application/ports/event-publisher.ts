import type { DomainEvent } from '@payflow/contracts';

export abstract class EventPublisher {
  abstract publish<T>(event: DomainEvent<T>): Promise<void>;
}
