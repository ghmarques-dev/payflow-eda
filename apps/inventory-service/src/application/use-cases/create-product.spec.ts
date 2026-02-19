import { InMemoryProductRepository } from '../repositories/database';

import { ProductRepository } from '@/domain/repositories/database';
import { SkuGenerator } from '@/domain/services/sku-generator';

import { CreateProductUseCase } from './create-product';

let productRepository: ProductRepository;
let skuGenerator: SkuGenerator;
let sut: CreateProductUseCase;

describe('create product use case', () => {
  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    skuGenerator = {
      generate: jest.fn().mockResolvedValue('SKU-store-1-00000001'),
    };

    sut = new CreateProductUseCase(productRepository, skuGenerator);
  });

  it('should be able to create a product', async () => {
    const response = await sut.execute({
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
    });

    expect(response).toEqual(
      expect.objectContaining({
        product_id: expect.any(String),
        store_id: 'store-1',
        name: 'Potato',
        description: 'A potato is a potato',
        price_in_cents: 1000,
        is_active: true,
        sku: 'SKU-store-1-00000001',
        created_at: expect.any(Date),
      }),
    );
  });

  it('should call skuGenerator.generate with store_id and name', async () => {
    const skuGeneratorGenerateSpy = jest.spyOn(skuGenerator, 'generate');

    await sut.execute({
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
    });

    expect(skuGeneratorGenerateSpy).toHaveBeenCalledWith({
      store_id: 'store-1',
      name: 'Potato',
    });
  });

  it('should call productRepository.create with correct values including sku', async () => {
    const productRepositoryCreateSpy = jest.spyOn(productRepository, 'create');

    await sut.execute({
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
    });

    expect(productRepositoryCreateSpy).toHaveBeenCalledWith({
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
      is_active: true,
      sku: 'SKU-store-1-00000001',
    });
  });
});
