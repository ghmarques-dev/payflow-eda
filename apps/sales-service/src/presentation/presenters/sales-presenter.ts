import { Sale } from '@/domain/entities'

export class SalesPresenter {
  static toHTTP(sale: Sale) {
    return {
      sale_id: sale.sale_id,
      operator_id: sale.operator_id,
      store_id: sale.store_id,
      status: sale.status,
      items: sale.items,
      subtotal_in_cents: sale.subtotal_in_cents,
      discount_in_cents: sale.discount_in_cents,
      total_in_cents: sale.total_in_cents,
      created_at: sale.created_at,
      finished_at: sale.finished_at,
    }
  }
}