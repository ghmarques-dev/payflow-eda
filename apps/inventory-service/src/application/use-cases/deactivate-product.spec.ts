import { InMemoryProductRepository } from '../repositories/database';
import { DeactivateProductUseCase } from './deactivate-product';
import { ProductNotFoundError } from '@/application/errors';

let productRepository: InMemoryProductRepository;
let sut: DeactivateProductUseCase;

describe('deactivate product use case', () => {
  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    sut = new DeactivateProductUseCase(productRepository);

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

  it('should be able to deactivate a product', async () => {
    const [product] = productRepository.items;

    const result = await sut.execute({
      product_id: product.product_id,
    });

    expect(result.is_active).toBe(false);
  });

  it('should call productRepository.findById with correct values', async () => {
    const productRepositoryFindByIdSpy = jest.spyOn(productRepository, 'findById');

    await sut.execute({
      product_id: 'product-1',
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
    });

    expect(productRepositoryUpdateSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
      is_active: false,
    });
  });
});
