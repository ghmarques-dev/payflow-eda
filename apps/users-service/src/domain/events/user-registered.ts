import { randomUUID } from "node:crypto";

import { DomainEvent } from "./domain-event";

export interface UserRegisteredPayload {
  readonly user_id: string;
  readonly email: string;
  readonly name: string;
  readonly occurred_at: Date;
}

export class UserRegisteredEvent implements DomainEvent<UserRegisteredPayload> {
  public trace_id: string;
  public origin: string;
  public event_type: string;
  public payload: UserRegisteredPayload;

  public constructor(payload: UserRegisteredPayload) {
    this.trace_id = randomUUID();
    this.event_type = 'UserRegisteredEvent';
    this.origin = 'users-service';
    this.payload = payload;
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  public toObject(): Omit<UserRegisteredEvent, 'toString' | 'toObject'> {
    return {
      trace_id: this.trace_id,
      origin: this.origin,
      event_type: this.event_type,
      payload: this.payload,
    };
  }
}