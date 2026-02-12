import { randomUUID } from 'node:crypto';

import {
  SALE_CHECKOUT_REQUESTED_EVENT_TYPE,
  type SaleCheckoutRequestedEventPayload,
  type DomainEvent
} from '@payflow/contracts';

const ORIGIN = 'sales-service';

export class SaleCheckoutRequestedEvent implements DomainEvent<SaleCheckoutRequestedEventPayload> {
  public trace_id: string;
  public origin: string;
  public event_type: string;
  public payload: SaleCheckoutRequestedEventPayload;

  constructor(payload: SaleCheckoutRequestedEventPayload) {
    this.trace_id = randomUUID();
    this.origin = ORIGIN;
    this.event_type = SALE_CHECKOUT_REQUESTED_EVENT_TYPE;
    this.payload = payload;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toObject(): Omit<SaleCheckoutRequestedEvent, 'toString' | 'toObject'> {
    return {
      trace_id: this.trace_id,
      origin: this.origin,
      event_type: this.event_type,
      payload: this.payload,
    };
  }
}
