import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.service';

import { SalesRepository } from '@/domain/repositories/database';
import type { Sale } from '@/domain/entities';

import type { Prisma } from 'prisma/generated/client';

@Injectable()
export class PrismaSalesRepository implements SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(
    input: SalesRepository.CreateDraft.Input
  ): Promise<SalesRepository.CreateDraft.Output> {
    const sale = await this.prisma.sale.create({
      data: {
        operator_id: input.operator_id,
        store_id: input.store_id,
        status: input.status,
        subtotal_in_cents: 0,
        discount_in_cents: 0,
        total_in_cents: 0,
      },
    });
   
    return this.toDomain(sale);
  }

  async update(
    input: SalesRepository.Update.Input
  ): Promise<SalesRepository.Update.Output> {
    const sale = await this.prisma.sale.update({
      where: { sale_id: input.sale_id },
      data: {
        ...input.data,
        items: {
          create: input.data.items,
        },
      },
    });

    return this.toDomain(sale);
  }
  
  async findById(
    input: SalesRepository.FindById.Input
  ): Promise<SalesRepository.FindById.Output> {
    const sale = await this.prisma.sale.findUnique({
      where: { sale_id: input.sale_id },
    });
    
    return sale ? this.toDomain(sale) : null;
  }

  private toDomain(sale: Prisma.SaleModel): Sale {
    return {
      sale_id: sale.sale_id,
      operator_id: sale.operator_id,
      store_id: sale.store_id,
      status: sale.status,
      subtotal_in_cents: sale.subtotal_in_cents,
      items: [],
      discount_in_cents: sale.discount_in_cents,
      total_in_cents: sale.total_in_cents,
      created_at: sale.created_at,
      finished_at: sale.finished_at ?? undefined,
    };
  }
}
