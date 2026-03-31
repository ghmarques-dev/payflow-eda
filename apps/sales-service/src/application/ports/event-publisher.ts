import type { DomainEvent } from '@payflow/contracts';

export abstract class EventPublisher {
  abstract publish<T>(input: EventPublisher.Publish.Input<T>): Promise<void>;
}

export namespace EventPublisher {
  export namespace Publish {
    export type Input<T> = {
      event: DomainEvent<T>;
      routing_key: string;
    };

    export type Output = void;
  }
}
