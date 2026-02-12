import { randomUUID } from 'node:crypto';

import { type Sale } from '@/domain/entities';
import { SalesRepository } from '@/domain/repositories';

export class InMemorySalesRepository implements SalesRepository {
  private sales: Sale[] = [];

  async createDraft(
    input: SalesRepository.CreateDraft.Input
  ): Promise<SalesRepository.CreateDraft.Output> {
    const sale: Sale = {
      sale_id: input.sale_id ?? randomUUID(),
      operator_id: input.operator_id,
      store_id: input.store_id,
      status: input.status,
      items: [],
      created_at: new Date(),
    }

    this.sales.push(sale);

    return sale;
  }

  async update(
    input: SalesRepository.Update.Input
  ): Promise<SalesRepository.Update.Output> {
    const saleToUpdate = this.sales.find(sale => sale.sale_id === input.sale_id);

    if (!saleToUpdate) {
      throw new Error('Sale not found');
    }

    Object.assign(saleToUpdate, input.data);

    this.sales = 
      this.sales.map(sale => sale.sale_id === input.sale_id ? saleToUpdate : sale);

    return saleToUpdate;
  }

  async findById(
    input: SalesRepository.FindById.Input
  ): Promise<SalesRepository.FindById.Output> {
    const sale = this.sales.find(sale => sale.sale_id === input.sale_id);

    return sale ?? null;
  }
}
