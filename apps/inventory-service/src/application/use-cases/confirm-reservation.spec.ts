import { InMemoryProductStockRepository } from '../repositories/database';
import { ConfirmReservationUseCase } from './confirm-reservation';
import {
  ProductStockNotFoundError,
  InvalidQuantityError,
  InsufficientReservedQuantityError,
} from '@/application/errors';

let productStockRepository: InMemoryProductStockRepository;
let sut: ConfirmReservationUseCase;

describe('confirm reservation use case', () => {
  beforeEach(async () => {
    productStockRepository = new InMemoryProductStockRepository();
    sut = new ConfirmReservationUseCase(productStockRepository);

    await productStockRepository.create({
      product_stock_id: 'product-stock-1',
      product_id: 'product-1',
      available_quantity: 5,
      reserved_quantity: 10,
    });
  });

  it('should be able to confirm reservation', async () => {
    const result = await sut.execute({
      product_id: 'product-1',
      quantity: 4,
    });

    expect(result.product_stock_id).toBe('product-stock-1');
    expect(result.available_quantity).toBe(5);
    expect(result.reserved_quantity).toBe(6);
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
      quantity: 4,
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

  it('should throw InsufficientReservedQuantityError when reserved < quantity', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent',
        quantity: 5,
      }),
    ).rejects.toThrow(ProductStockNotFoundError);
  });

  it('should call productStockRepository.update with correct values', async () => {
    const productStockRepositoryUpdateSpy = jest.spyOn(productStockRepository, 'update');

    await sut.execute({
      product_id: 'product-1',
      quantity: 4,
    });

    expect(productStockRepositoryUpdateSpy).toHaveBeenCalledWith({
      product_stock_id: 'product-stock-1',
      available_quantity: 5,
      reserved_quantity: 6,
    });
  });
});
