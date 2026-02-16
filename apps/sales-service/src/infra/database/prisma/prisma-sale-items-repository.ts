import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { SaleItemsRepository } from '@/domain/repositories/database';

@Injectable()
export class PrismaSaleItemsRepository implements SaleItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: SaleItemsRepository.Create.Input
  ): Promise<SaleItemsRepository.Create.Output> {
    const saleItem = await this.prisma.saleItem.create({
      data: input,
    });

    return saleItem;
  }

  async update(
    input: SaleItemsRepository.Update.Input
  ): Promise<SaleItemsRepository.Update.Output> {
    const saleItem = await this.prisma.saleItem.update({
      where: { sale_item_id: input.sale_item_id },
      data: input.data,
    });

    return saleItem;
  }

  async findById(
    input: SaleItemsRepository.FindById.Input
  ): Promise<SaleItemsRepository.FindById.Output> {
    const saleItem = await this.prisma.saleItem.findUnique({
      where: { sale_item_id: input.sale_item_id },
    });

    return saleItem;
  }

  async delete(
    input: SaleItemsRepository.Delete.Input
  ): Promise<SaleItemsRepository.Delete.Output> {
    await this.prisma.saleItem.delete({
      where: { sale_item_id: input.sale_item_id },
    });
  }

  async findBySaleId(
    input: SaleItemsRepository.FindBySaleId.Input
  ): Promise<SaleItemsRepository.FindBySaleId.Output> {
    const saleItems = await this.prisma.saleItem.findMany({
      where: { sale_id: input.sale_id },
    });

    return saleItems;
  }
}
