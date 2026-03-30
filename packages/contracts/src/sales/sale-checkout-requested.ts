export interface SaleCheckoutRequestedEventPayload {
  sale_id: string;
  items: Array<SaleCheckoutItem>;
  occurred_at: Date;
}

export type SaleCheckoutItem = {
  sale_item_id: string;
  product_id: string;
  quantity: number;
  unit_price_in_cents: number;
}

export const SALE_CHECKOUT_REQUESTED_EVENT_TYPE = 'sale.checkout_requested';
