import { randomUUID } from 'node:crypto';

import { type SaleItem } from '@/domain/entities';
import { SaleItemsRepository } from '@/domain/repositories/database';

export class InMemorySaleItemsRepository implements SaleItemsRepository {
  private saleItems: SaleItem[] = [];

  async create(
    input: SaleItemsRepository.Create.Input
  ): Promise<SaleItemsRepository.Create.Output> {
    const saleItem: SaleItem = {
      sale_item_id: input.sale_item_id ?? randomUUID(),
      sale_id: input.sale_id,
      product_id: input.product_id,
      quantity: input.quantity,
      unit_price_in_cents: input.unit_price_in_cents,
      created_at: new Date(),
    };

    this.saleItems.push(saleItem);

    return saleItem;
  }

  async update(
    input: SaleItemsRepository.Update.Input
  ): Promise<SaleItemsRepository.Update.Output> {
    const saleItemToUpdate = this.saleItems.find(
      item => item.sale_item_id === input.sale_item_id
    );

    if (!saleItemToUpdate) {
      throw new Error('Sale item not found');
    }

    Object.assign(saleItemToUpdate, input.data);

    this.saleItems = this.saleItems.map(item =>
      item.sale_item_id === input.sale_item_id ? saleItemToUpdate : item
    );

    return saleItemToUpdate;
  }

  async findById(
    input: SaleItemsRepository.FindById.Input
  ): Promise<SaleItemsRepository.FindById.Output> {
    const saleItem = this.saleItems.find(
      item => item.sale_item_id === input.sale_item_id
    );

    return saleItem ?? null;
  }

  async delete(
    input: SaleItemsRepository.Delete.Input
  ): Promise<SaleItemsRepository.Delete.Output> {
    const saleItemIndex = this.saleItems.findIndex(
      item => item.sale_item_id === input.sale_item_id
    );

    if (saleItemIndex === -1) {
      throw new Error('Sale item not found');
    }

    this.saleItems.splice(saleItemIndex, 1);
  }

  async findBySaleId(
    input: SaleItemsRepository.FindBySaleId.Input
  ): Promise<SaleItemsRepository.FindBySaleId.Output> {
    return this.saleItems.filter(
      item => item.sale_id === input.sale_id
    );
  }
}
