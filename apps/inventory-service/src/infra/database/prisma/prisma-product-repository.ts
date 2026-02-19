import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { ProductRepository } from '@/domain/repositories/database';
import type { Product } from '@/domain/entities';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: ProductRepository.Create.Input,
  ): Promise<ProductRepository.Create.Output> {
    const row = await this.prisma.product.create({
      data: {
        store_id: input.store_id,
        name: input.name,
        description: input.description,
        price_in_cents: input.price_in_cents,
        is_active: input.is_active ?? true,
        sku: input.sku,
      },
    });

    return this.toDomain(row);
  }

  async update(
    input: ProductRepository.Update.Input,
  ): Promise<ProductRepository.Update.Output> {
    const row = await this.prisma.product.update({
      where: { product_id: input.product_id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price_in_cents !== undefined && {
          price_in_cents: input.price_in_cents,
        }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        ...(input.sku !== undefined && { sku: input.sku }),
      },
    });

    return this.toDomain(row);
  }

  async findById(
    input: ProductRepository.FindById.Input,
  ): Promise<ProductRepository.FindById.Output> {
    const row = await this.prisma.product.findUnique({
      where: { product_id: input.product_id },
    });

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    product_id: string;
    store_id: string;
    name: string;
    description: string;
    price_in_cents: number;
    is_active: boolean;
    sku: string;
    created_at: Date;
    updated_at: Date;
  }): Product {
    return {
      product_id: row.product_id,
      store_id: row.store_id,
      name: row.name,
      description: row.description,
      price_in_cents: row.price_in_cents,
      is_active: row.is_active,
      sku: row.sku,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
