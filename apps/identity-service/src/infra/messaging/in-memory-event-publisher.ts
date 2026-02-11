import type { EventPublisher } from '@/application/ports';
import type { DomainEvent } from '@/domain/events';

export class InMemoryEventPublisher implements EventPublisher {
  private readonly _publishedEvents: DomainEvent<unknown>[] = [];

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this._publishedEvents.push(event as DomainEvent<unknown>);
  }

  get publishedEvents(): readonly DomainEvent<unknown>[] {
    return this._publishedEvents;
  }

  clear(): void {
    this._publishedEvents.length = 0;
  }
}
