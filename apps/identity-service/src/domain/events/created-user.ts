import { randomUUID } from 'node:crypto';

import {
  CREATED_USER_EVENT_TYPE,
  type CreatedUserEventPayload,
} from '@payflow/contracts';

import { DomainEvent } from './domain-event';

const ORIGIN = 'users-service';

export class UserRegisteredEvent implements DomainEvent<CreatedUserEventPayload> {
  public trace_id: string;
  public origin: string;
  public event_type: string;
  public payload: CreatedUserEventPayload;

  constructor(payload: CreatedUserEventPayload) {
    this.trace_id = randomUUID();
    this.origin = ORIGIN;
    this.event_type = CREATED_USER_EVENT_TYPE;
    this.payload = payload;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toObject(): Omit<UserRegisteredEvent, 'toString' | 'toObject'> {
    return {
      trace_id: this.trace_id,
      origin: this.origin,
      event_type: this.event_type,
      payload: this.payload,
    };
  }
}
