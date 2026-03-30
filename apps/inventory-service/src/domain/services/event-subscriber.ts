export abstract class EventSubscriber {
  abstract subscribe(input: EventSubscriber.Subscribe.Input): Promise<void>;
}

export namespace EventSubscriber {
  export namespace Subscribe {
    export type Input = {
      routing_key: string;
      handler: (payload: unknown) => Promise<void>;
    };

    export type Output = void;
  }
}
