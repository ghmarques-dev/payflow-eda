export interface DomainEvent<T> {
  trace_id: string;
  origin: string;
  event_type: string;
  payload: T;
  toString(): string;
  toObject(): Record<string, unknown>;
}

export interface DomainEventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}
