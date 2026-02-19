import { Injectable } from '@nestjs/common';

import {
  ProductRepository,
  ProductStockRepository,
} from '@/domain/repositories/database';
import type { ProductStock } from '@/domain/entities';
import {
  ProductNotFoundError,
  ProductStockAlreadyExistsError,
} from '@/application/errors';

export type ICreateStockForProductUseCaseInput = {
  product_id: string; 
  available_quantity: number;
  reserved_quantity?: number;
};

export type ICreateStockForProductUseCaseOutput = ProductStock;

@Injectable()
export class CreateStockForProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productStockRepository: ProductStockRepository,
  ) {}

  async execute(
    input: ICreateStockForProductUseCaseInput,
  ): Promise<ICreateStockForProductUseCaseOutput> {
    const product = await this.productRepository.findById({
      product_id: input.product_id,
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    const existingStock = await this.productStockRepository.findByProductId({
      product_id: input.product_id,
    });

    if (existingStock) {
      throw new ProductStockAlreadyExistsError(input.product_id);
    }

    const createdStock = await this.productStockRepository.create({
      product_id: input.product_id,
      available_quantity: input.available_quantity,
      reserved_quantity: input.reserved_quantity ?? 0,
    });

    return createdStock;
  }
}
