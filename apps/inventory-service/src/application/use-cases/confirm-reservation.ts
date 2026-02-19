import { Injectable } from '@nestjs/common';

import { ProductStockRepository } from '@/domain/repositories/database';
import type { ProductStock } from '@/domain/entities';
import {
  ProductStockNotFoundError,
  InvalidQuantityError,
  InsufficientReservedQuantityError,
} from '@/application/errors';

export type IConfirmReservationUseCaseInput = {
  product_id: string;
  quantity: number;
};

export type IConfirmReservationUseCaseOutput = ProductStock;

@Injectable()
export class ConfirmReservationUseCase {
  constructor(
    private readonly productStockRepository: ProductStockRepository,
  ) {}

  async execute(
    input: IConfirmReservationUseCaseInput,
  ): Promise<IConfirmReservationUseCaseOutput> {
    if (input.quantity <= 0) {
      throw new InvalidQuantityError('Quantity must be greater than 0');
    }

    const stock = await this.productStockRepository.findByProductId({
      product_id: input.product_id,
    });

    if (!stock) {
      throw new ProductStockNotFoundError();
    }

    if (stock.reserved_quantity < input.quantity) {
      throw new InsufficientReservedQuantityError(
        stock.reserved_quantity,
        input.quantity,
      );
    }

    const newReserved = stock.reserved_quantity - input.quantity;

    return this.productStockRepository.update({
      product_stock_id: stock.product_stock_id,
      available_quantity: stock.available_quantity,
      reserved_quantity: newReserved,
    });
  }
}
