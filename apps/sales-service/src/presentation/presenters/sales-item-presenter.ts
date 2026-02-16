import { SaleItem } from '@/domain/entities'

export class SalesItemPresenter {
  static toHTTP(saleItem: SaleItem) {
    return {
      sale_item_id: saleItem.sale_item_id,
      sale_id: saleItem.sale_id,
      product_id: saleItem.product_id,
      quantity: saleItem.quantity,
      unit_price_in_cents: saleItem.unit_price_in_cents,
      created_at: saleItem.created_at,
    }
  }
}