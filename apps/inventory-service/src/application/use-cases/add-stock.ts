import { Injectable } from '@nestjs/common';

import { ProductStockRepository } from '@/domain/repositories/database';
import type { ProductStock } from '@/domain/entities';
import {
  ProductStockNotFoundError,
  InvalidQuantityError,
} from '@/application/errors';

export type IAddStockUseCaseInput = {
  product_id: string;
  quantity: number;
};

export type IAddStockUseCaseOutput = ProductStock;

@Injectable()
export class AddStockUseCase {
  constructor(
    private readonly productStockRepository: ProductStockRepository,
  ) {}

  async execute(input: IAddStockUseCaseInput): Promise<IAddStockUseCaseOutput> {
    if (input.quantity <= 0) {
      throw new InvalidQuantityError('Quantity must be greater than 0');
    }

    const stock = await this.productStockRepository.findByProductId({
      product_id: input.product_id,
    });

    if (!stock) {
      throw new ProductStockNotFoundError();
    }

    const newAvailable = stock.available_quantity + input.quantity;

    return this.productStockRepository.update({
      product_stock_id: stock.product_stock_id,
      available_quantity: newAvailable,
      reserved_quantity: stock.reserved_quantity,
    });
  }
}
