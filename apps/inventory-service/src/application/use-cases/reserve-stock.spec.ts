import { InMemoryProductStockRepository } from '../repositories/database';
import { ReserveStockUseCase } from './reserve-stock';
import {
  ProductStockNotFoundError,
  InvalidQuantityError,
  InsufficientAvailableQuantityError,
} from '@/application/errors';

let productStockRepository: InMemoryProductStockRepository;
let sut: ReserveStockUseCase;

describe('reserve stock use case', () => {
  beforeEach(async () => {
    productStockRepository = new InMemoryProductStockRepository();
    sut = new ReserveStockUseCase(productStockRepository);

    await productStockRepository.create({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 0,
    });
  });

  it('should be able to reserve stock', async () => {
    const result = await sut.execute({
      product_id: 'product-1',
      quantity: 3,
    });

    expect(result.available_quantity).toBe(7);
    expect(result.reserved_quantity).toBe(3);
  });

  it('should throw InvalidQuantityError when quantity is zero or negative', async () => {
    await expect(
      sut.execute({
        product_id: 'product-1',
        quantity: 0,
      }),
    ).rejects.toThrow(InvalidQuantityError);
  });

  it('should call productStockRepository.findByProductId with correct values', async () => {
    const productStockRepositoryFindByProductIdSpy = jest.spyOn(productStockRepository, 'findByProductId');

    await sut.execute({
      product_id: 'product-1',
      quantity: 3,
    });

    expect(productStockRepositoryFindByProductIdSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should throw ProductStockNotFoundError when stock does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent',
        quantity: 5,
      }),
    ).rejects.toThrow(ProductStockNotFoundError);
  });

  it('should throw InsufficientAvailableQuantityError when available < quantity', async () => {
    await expect(
      sut.execute({
        product_id: 'product-1',
        quantity: 15,
      }),
    ).rejects.toThrow(InsufficientAvailableQuantityError);
  });

  it('should call productStockRepository.update with correct values', async () => {
    const productStockRepositoryUpdateSpy = jest.spyOn(productStockRepository, 'update');

    await sut.execute({
      product_id: 'product-1',
      quantity: 3,
    });

    expect(productStockRepositoryUpdateSpy).toHaveBeenCalledWith({
      product_stock_id: expect.any(String),
      available_quantity: expect.any(Number),
      reserved_quantity: expect.any(Number),
    });
  });

});
