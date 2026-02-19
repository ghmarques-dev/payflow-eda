import { InMemoryProductStockRepository } from '../repositories/database';
import { GetProductStockByProductIdUseCase } from './get-product-stock-by-product-id';
import { ProductStockNotFoundError } from '@/application/errors';

let productStockRepository: InMemoryProductStockRepository;
let sut: GetProductStockByProductIdUseCase;

describe('get product stock by product id use case', () => {
  beforeEach(async () => {
    productStockRepository = new InMemoryProductStockRepository();
    sut = new GetProductStockByProductIdUseCase(productStockRepository);

    await productStockRepository.create({
      product_stock_id: 'product-stock-1',
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 2,
    });
  });

  it('should be able to get stock by product_id', async () => {
    const result = await sut.execute({
      product_id: 'product-1',
    });

    expect(result).toMatchObject({
      product_stock_id: 'product-stock-1',
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 2,
    });
    expect(result.product_stock_id).toBeDefined();
  });

  it('should call productStockRepository.findByProductId with correct values', async () => {
    const productStockRepositoryFindByProductIdSpy = jest.spyOn(productStockRepository, 'findByProductId');

    await sut.execute({
      product_id: 'product-1',
    });

    expect(productStockRepositoryFindByProductIdSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should throw ProductStockNotFoundError when stock does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent',
      }),
    ).rejects.toThrow(ProductStockNotFoundError);
  });
});
