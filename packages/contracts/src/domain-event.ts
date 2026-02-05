export interface DomainEvent<T = unknown> {
  trace_id: string;
  origin: string;
  event_type: string;
  payload: T;
}
