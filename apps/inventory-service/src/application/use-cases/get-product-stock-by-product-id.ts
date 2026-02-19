import { Injectable } from '@nestjs/common';

import { ProductStockRepository } from '@/domain/repositories/database';
import type { ProductStock } from '@/domain/entities';
import { ProductStockNotFoundError } from '@/application/errors';

export type IGetProductStockByProductIdUseCaseInput = {
  product_id: string;
};

export type IGetProductStockByProductIdUseCaseOutput = ProductStock;

@Injectable()
export class GetProductStockByProductIdUseCase {
  constructor(
    private readonly productStockRepository: ProductStockRepository,
  ) {}

  async execute(
    input: IGetProductStockByProductIdUseCaseInput,
  ): Promise<IGetProductStockByProductIdUseCaseOutput> {
    const stock = await this.productStockRepository.findByProductId({
      product_id: input.product_id,
    });

    if (!stock) {
      throw new ProductStockNotFoundError();
    }

    return stock;
  }
}
