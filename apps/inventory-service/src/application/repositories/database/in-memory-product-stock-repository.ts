import { randomUUID } from 'node:crypto';

import type { ProductStock } from '@/domain/entities';
import { ProductStockRepository } from '@/domain/repositories/database';

export class InMemoryProductStockRepository implements ProductStockRepository {
  public items: ProductStock[] = [];

  async create(
    input: ProductStockRepository.Create.Input,
  ): Promise<ProductStockRepository.Create.Output> {
    const stock: ProductStock = {
      product_stock_id: input.product_stock_id ?? randomUUID(),
      product_id: input.product_id,
      available_quantity: input.available_quantity ?? 0,
      reserved_quantity: input.reserved_quantity ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(stock);
    return stock;
  }

  async update(
    input: ProductStockRepository.Update.Input,
  ): Promise<ProductStockRepository.Update.Output> {
    const index = this.items.findIndex(
      (s) => s.product_stock_id === input.product_stock_id,
    );
    if (index === -1) {
      throw new Error('ProductStock not found');
    }

    const updated: ProductStock = {
      ...this.items[index],
      available_quantity: input.available_quantity,
      reserved_quantity: input.reserved_quantity,
      updated_at: new Date(),
    };

    this.items[index] = updated;
    return updated;
  }

  async findById(
    input: ProductStockRepository.FindById.Input,
  ): Promise<ProductStockRepository.FindById.Output> {
    return (
      this.items.find((s) => s.product_stock_id === input.product_stock_id) ??
      null
    );
  }

  async findByProductId(
    input: ProductStockRepository.FindByProductId.Input,
  ): Promise<ProductStockRepository.FindByProductId.Output> {
    return (
      this.items.find((s) => s.product_id === input.product_id) ?? null
    );
  }
}
