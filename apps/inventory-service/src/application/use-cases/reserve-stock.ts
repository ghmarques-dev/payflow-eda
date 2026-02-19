import { Injectable } from '@nestjs/common';

import { ProductStockRepository } from '@/domain/repositories/database';
import type { ProductStock } from '@/domain/entities';
import {
  ProductStockNotFoundError,
  InvalidQuantityError,
  InsufficientAvailableQuantityError,
} from '@/application/errors';

export type IReserveStockUseCaseInput = {
  product_id: string;
  quantity: number;
  sale_id?: string;
};

export type IReserveStockUseCaseOutput = ProductStock;

@Injectable()
export class ReserveStockUseCase {
  constructor(
    private readonly productStockRepository: ProductStockRepository,
  ) {}

  async execute(
    input: IReserveStockUseCaseInput,
  ): Promise<IReserveStockUseCaseOutput> {
    if (input.quantity <= 0) {
      throw new InvalidQuantityError('Quantity must be greater than 0');
    }

    const stock = await this.productStockRepository.findByProductId({
      product_id: input.product_id,
    });

    if (!stock) {
      throw new ProductStockNotFoundError();
    }

    if (stock.available_quantity < input.quantity) {
      throw new InsufficientAvailableQuantityError(
        stock.available_quantity,
        input.quantity,
      );
    }

    const newAvailable = stock.available_quantity - input.quantity;
    const newReserved = stock.reserved_quantity + input.quantity;

    const updatedStock = await this.productStockRepository.update({
      product_stock_id: stock.product_stock_id,
      available_quantity: newAvailable,
      reserved_quantity: newReserved,
    });

    return updatedStock;
  }
}
