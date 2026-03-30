import type { DomainEvent } from '@payflow/contracts';

import { EventPublisher } from '@/application/ports';

export class InMemoryEventPublisher implements EventPublisher {
  public publishedEvents: DomainEvent<any>[] = [];

  async publish<T>({ event }: EventPublisher.Publish.Input<T>): Promise<void> {
    this.publishedEvents.push(event);
  }

  clear(): void {
    this.publishedEvents = [];
  }
}
