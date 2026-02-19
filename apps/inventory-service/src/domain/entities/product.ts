export interface Product {
  product_id: string;
  store_id: string;
  
  name: string;
  description: string;
  price_in_cents: number;
  is_active: boolean;
  sku: string;

  created_at: Date;
  updated_at: Date;
}