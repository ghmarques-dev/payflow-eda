import { randomUUID } from 'node:crypto';

import type { Product } from '@/domain/entities';
import { ProductRepository } from '@/domain/repositories/database';

export class InMemoryProductRepository implements ProductRepository {
  public items: Product[] = [];

  async create(
    input: ProductRepository.Create.Input,
  ): Promise<ProductRepository.Create.Output> {
    const product: Product = {
      product_id: input.product_id ?? randomUUID(),
      store_id: input.store_id,
      name: input.name,
      description: input.description,
      price_in_cents: input.price_in_cents,
      is_active: input.is_active ?? true,
      sku: input.sku,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(product);
    return product;
  }

  async update(
    input: ProductRepository.Update.Input,
  ): Promise<ProductRepository.Update.Output> {
    const index = this.items.findIndex((p) => p.product_id === input.product_id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    const current = this.items[index];
    const updated: Product = {
      ...current,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price_in_cents !== undefined && {
        price_in_cents: input.price_in_cents,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
      ...(input.sku !== undefined && { sku: input.sku }),
      updated_at: new Date(),
    };

    this.items[index] = updated;
    return updated;
  }

  async findById(
    input: ProductRepository.FindById.Input,
  ): Promise<ProductRepository.FindById.Output> {
    const productExists = this.items.find(
      (product) => product.product_id === input.product_id,
    );

    return productExists ?? null;
  }
}
