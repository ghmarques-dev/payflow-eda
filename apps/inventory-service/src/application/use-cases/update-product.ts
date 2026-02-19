import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@/domain/repositories/database';
import type { Product } from '@/domain/entities';
import { ProductNotFoundError } from '@/application/errors';

export type IUpdateProductUseCaseInput = {
  product_id: string;
  name?: string;
  description?: string;
  price_in_cents?: number;
  is_active?: boolean;
};

export type IUpdateProductUseCaseOutput = Product;

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    input: IUpdateProductUseCaseInput,
  ): Promise<IUpdateProductUseCaseOutput> {
    const productExists = await this.productRepository.findById({
      product_id: input.product_id,
    });

    if (!productExists) {
      throw new ProductNotFoundError();
    }

    const product = await this.productRepository.update({
      product_id: input.product_id,
      name: input.name,
      description: input.description ?? productExists.description,
      price_in_cents: input.price_in_cents ?? productExists.price_in_cents,
      is_active: input.is_active ?? productExists.is_active,
    });

    return product;
  }
}
