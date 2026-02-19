import { Injectable } from '@nestjs/common';

import { ProductRepository } from '@/domain/repositories/database';
import { SkuGenerator } from '@/domain/services/sku-generator';
import type { Product } from '@/domain/entities';

export type ICreateProductUseCaseInput = {
  store_id: string;
  name: string;
  description: string;
  price_in_cents: number;
  is_active?: boolean;
};

export type ICreateProductUseCaseOutput = Product;

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly skuGenerator: SkuGenerator,
  ) {}

  async execute(
    input: ICreateProductUseCaseInput,
  ): Promise<ICreateProductUseCaseOutput> {
    const sku = await this.skuGenerator.generate({
      store_id: input.store_id,
      name: input.name,
    });

    const product = await this.productRepository.create({
      store_id: input.store_id,
      name: input.name,
      description: input.description,
      price_in_cents: input.price_in_cents,
      is_active: input.is_active ?? true,
      sku,
    });

    return product;
  }
}
