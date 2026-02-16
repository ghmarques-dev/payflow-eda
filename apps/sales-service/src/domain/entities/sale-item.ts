export interface SaleItem {
  sale_item_id: string;
  sale_id: string;
  product_id: string;

  quantity: number;
  unit_price_in_cents: number;

  created_at: Date;
}