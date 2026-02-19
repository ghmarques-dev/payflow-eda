import type { Product } from '@/domain/entities';

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      store_id: product.store_id,
      name: product.name,
      description: product.description,
      price_in_cents: product.price_in_cents,
      is_active: product.is_active,
      sku: product.sku,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }
}
