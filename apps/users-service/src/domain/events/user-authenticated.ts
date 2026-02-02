import { randomUUID } from "node:crypto";

import { DomainEvent } from "./domain-event";

export interface UserAuthenticatedPayload {
  readonly user_id: string;
  readonly email: string;
}

export class UserAuthenticatedEvent implements DomainEvent<UserAuthenticatedPayload> {
  public trace_id: string;
  public origin: string;
  public event_type: string;
  public payload: UserAuthenticatedPayload;

  public constructor(payload: UserAuthenticatedPayload) {
    this.trace_id = randomUUID();
    this.event_type = 'UserAuthenticatedEvent';
    this.origin = 'users-service';
    this.payload = payload;
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  public toObject(): Omit<UserAuthenticatedEvent, 'toString' | 'toObject'> {
    return {
      trace_id: this.trace_id,
      origin: this.origin,
      event_type: this.event_type,
      payload: this.payload,
    };
  }
}