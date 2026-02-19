import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@/domain/repositories/database';
import type { Product } from '@/domain/entities';
import { ProductNotFoundError } from '@/application/errors';

export type IActivateProductUseCaseInput = {
  product_id: string;
};

export type IActivateProductUseCaseOutput = Product;

@Injectable()
export class ActivateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    input: IActivateProductUseCaseInput,
  ): Promise<IActivateProductUseCaseOutput> {
    const product = await this.productRepository.findById({
      product_id: input.product_id,
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    const updatedProduct = await this.productRepository.update({
      product_id: input.product_id,
      is_active: true,
    });

    return updatedProduct;
  }
}
