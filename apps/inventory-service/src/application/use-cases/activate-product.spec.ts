import { InMemoryProductRepository } from '../repositories/database';
import { ActivateProductUseCase } from './activate-product';
import { ProductNotFoundError } from '@/application/errors';

let productRepository: InMemoryProductRepository;
let sut: ActivateProductUseCase;

describe('activate product use case', () => {
  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    sut = new ActivateProductUseCase(productRepository);

    await productRepository.create({
      product_id: 'product-1',
      store_id: 'store-1',
      name: 'Potato',
      description: 'A potato is a potato',
      price_in_cents: 1000,
      is_active: false,
      sku: 'SKU-store-1-00000001',
    });
  });

  it('should be able to activate a product', async () => {
    const [product] = productRepository.items;

    const result = await sut.execute({
      product_id: product.product_id,
    });

    expect(result.is_active).toBe(true);
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

  it('should throw ProductNotFoundError when product does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent',
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
      is_active: true,
    });
  });
});
