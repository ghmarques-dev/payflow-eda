export interface SaleItem {
  sale_item_id: string;
  sale_id: string;
  product_id: string;

  quantity: number;
  unitPriceInCents: number;

  created_at: Date;
}