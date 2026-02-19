import type { ProductStock } from '@/domain/entities';

export class ProductStockPresenter {
  static toHTTP(stock: ProductStock) {
    return {
      product_id: stock.product_id,
      available_quantity: stock.available_quantity,
      reserved_quantity: stock.reserved_quantity,
      created_at: stock.created_at,
      updated_at: stock.updated_at,
    };
  }
}
