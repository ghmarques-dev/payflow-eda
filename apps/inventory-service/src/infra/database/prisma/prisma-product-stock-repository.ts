import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { ProductStockRepository } from '@/domain/repositories/database';
import { ProductStock } from '@/domain/entities';

@Injectable()
export class PrismaProductStockRepository implements ProductStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: ProductStockRepository.Create.Input,
  ): Promise<ProductStockRepository.Create.Output> {
    const row = await this.prisma.productStock.create({
      data: {
        product_id: input.product_id,
        available_quantity: input.available_quantity ?? 0,
        reserved_quantity: input.reserved_quantity ?? 0,
      },
    });

    return this.toDomain(row);
  }

  async update(
    input: ProductStockRepository.Update.Input,
  ): Promise<ProductStockRepository.Update.Output> {
    const row = await this.prisma.productStock.update({
      where: { product_stock_id: input.product_stock_id },
      data: {
        available_quantity: input.available_quantity,
        reserved_quantity: input.reserved_quantity,
      },
    });

    return this.toDomain(row);
  }

  async findById(
    input: ProductStockRepository.FindById.Input,
  ): Promise<ProductStockRepository.FindById.Output> {
    const row = await this.prisma.productStock.findUnique({
      where: { product_stock_id: input.product_stock_id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByProductId(
    input: ProductStockRepository.FindByProductId.Input,
  ): Promise<ProductStockRepository.FindByProductId.Output> {
    const row = await this.prisma.productStock.findUnique({
      where: { product_id: input.product_id },
    });

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: {
    product_stock_id: string;
    product_id: string;
    available_quantity: number;
    reserved_quantity: number;
    created_at: Date;
    updated_at: Date;
  }): ProductStock {
    return {
      product_stock_id: row.product_stock_id,
      product_id: row.product_id,
      available_quantity: row.available_quantity,
      reserved_quantity: row.reserved_quantity,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
