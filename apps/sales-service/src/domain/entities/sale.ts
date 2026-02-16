import type { SaleItem } from "./sale-item";

export type SaleStatus = 'DRAFT' | 'CHECKOUT_PENDING' | 'COMPLETED' | 'CANCELLED';
export interface Sale {
  sale_id: string;
  operator_id: string;
  store_id: string;

  status: SaleStatus;
  items: SaleItem[];
  subtotal_in_cents?: number;
  discount_in_cents?: number;
  total_in_cents?: number;

  created_at: Date;
  finished_at?: Date;
}