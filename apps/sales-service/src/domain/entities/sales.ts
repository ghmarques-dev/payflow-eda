import type { SalesItem } from "./sales-item";

export type SalesStatus = 'pending' | 'completed' | 'cancelled';

export interface Sales {
  sale_id: string;
  operator_id: string;
  store_id: string;

  status: SalesStatus;
  totalInCents: number;
  items: SalesItem[];

  created_at: Date;
  completed_at?: Date;
}