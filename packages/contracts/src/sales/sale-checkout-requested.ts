export interface SaleCheckoutRequestedEventPayload {
  sale_id: string;
  items: Array<Record<string, number>>;
  occurred_at: Date;
}

export const SALE_CHECKOUT_REQUESTED_EVENT_TYPE = 'sale.checkout_requested' as const;
