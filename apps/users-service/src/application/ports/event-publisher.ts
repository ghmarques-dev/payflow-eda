import type { DomainEvent } from '@/domain/events';

export interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}
