import type { DomainEvent } from '@payflow/contracts';

import { EventPublisher } from '@/application/ports';

export class InMemoryEventPublisher implements EventPublisher {
  public publishedEvents: DomainEvent<any>[] = [];

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.publishedEvents.push(event);
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
