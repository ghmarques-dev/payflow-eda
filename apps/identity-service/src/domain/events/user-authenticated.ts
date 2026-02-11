import { randomUUID } from 'node:crypto';

import {
  USER_AUTHENTICATED_EVENT_TYPE,
  type UserAuthenticatedEventPayload,
} from '@payflow/contracts';

import { DomainEvent } from './domain-event';

const ORIGIN = 'users-service';

export class UserAuthenticatedEvent implements DomainEvent<UserAuthenticatedEventPayload> {
  public trace_id: string;
  public origin: string;
  public event_type: string;
  public payload: UserAuthenticatedEventPayload;

  constructor(payload: UserAuthenticatedEventPayload) {
    this.trace_id = randomUUID();
    this.origin = ORIGIN;
    this.event_type = USER_AUTHENTICATED_EVENT_TYPE;
    this.payload = payload;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toObject(): Omit<UserAuthenticatedEvent, 'toString' | 'toObject'> {
    return {
      trace_id: this.trace_id,
      origin: this.origin,
      event_type: this.event_type,
      payload: this.payload,
    };
  }
}
