import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@/domain/repositories/database';
import type { Product } from '@/domain/entities';
import { ProductNotFoundError } from '@/application/errors';

export type IDeactivateProductUseCaseInput = {
  product_id: string;
};

export type IDeactivateProductUseCaseOutput = Product;

@Injectable()
export class DeactivateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    input: IDeactivateProductUseCaseInput,
  ): Promise<IDeactivateProductUseCaseOutput> {
    const product = await this.productRepository.findById({
      product_id: input.product_id,
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    const updatedProduct = await this.productRepository.update({
      product_id: input.product_id,
      is_active: false,
    });

    return updatedProduct;
  }
}
