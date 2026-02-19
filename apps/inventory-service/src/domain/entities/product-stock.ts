export interface ProductStock {
  product_stock_id: string;
  product_id: string;

  available_quantity: number;
  reserved_quantity: number;

  created_at: Date;
  updated_at: Date;
}