import { InMemoryProductRepository } from '../repositories/database';

import { ProductRepository } from '@/domain/repositories/database';

import { UpdateProductUseCase } from './update-product';
import { ProductNotFoundError } from '../errors';

let productRepository: ProductRepository;
let sut: UpdateProductUseCase;

describe('update product use case', () => {
  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();

    sut = new UpdateProductUseCase(productRepository);

    await productRepository.create({
      product_id: 'product-1',
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
      is_active: true,
      sku: 'SKU-store-1-00000001',
    });
  });

  it('should be able to update a product', async () => {
    const response = await sut.execute({
      product_id: 'product-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
      is_active: true,
    });

    expect(response).toEqual(
      expect.objectContaining({
        product_id: expect.any(String),
        store_id: 'store-1',
        name: 'Potato',
        description: 'A potato is a potato',
        price_in_cents: 1000,
        is_active: true,
        sku: expect.any(String),
        created_at: expect.any(Date),
      }),
    );
  });

  it('should call productRepository.findById with correct values', async () => {
    const productRepositoryFindByIdSpy = jest.spyOn(productRepository, 'findById');

    await sut.execute({
      product_id: 'product-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
    });

    expect(productRepositoryFindByIdSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should throw ProductNotFoundError if product does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent-product-id',
      }),
    ).rejects.toThrow(ProductNotFoundError);
  });

  it('should call productRepository.update with correct values', async () => {
    const productRepositoryUpdateSpy = jest.spyOn(productRepository, 'update');

    await sut.execute({
      product_id: 'product-1',
      name: 'Potato',
      description: 'A potato is a potato',
    });

    expect(productRepositoryUpdateSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
      is_active: true,
    });
  });
});
