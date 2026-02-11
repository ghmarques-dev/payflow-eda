import type { DomainEvent } from '@/domain/events';

export abstract class EventPublisher {
  abstract publish<T>(event: DomainEvent<T>): Promise<void>;
}
