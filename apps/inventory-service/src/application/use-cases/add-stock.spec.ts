import {
  InMemoryProductRepository,
  InMemoryProductStockRepository,
} from '../repositories/database';
import { AddStockUseCase } from './add-stock';
import { ProductStockNotFoundError, InvalidQuantityError } from '@/application/errors';

let productStockRepository: InMemoryProductStockRepository;
let sut: AddStockUseCase;

describe('AddStockUseCase', () => {
  beforeEach(async () => {
    productStockRepository = new InMemoryProductStockRepository();
    sut = new AddStockUseCase(productStockRepository);

    await productStockRepository.create({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 0,
    });
  });

  it('should add quantity to available stock', async () => {
    const result = await sut.execute({
      product_id: 'product-1',
      quantity: 5,
    });

    expect(result.available_quantity).toBe(15);
    expect(result.reserved_quantity).toBe(0);
  });

  it('should throw InvalidQuantityError when quantity is zero or negative', async () => {
    await expect(
      sut.execute({
        product_id: 'product-1',
        quantity: 0,
      }),
    ).rejects.toThrow(InvalidQuantityError);

    await expect(
      sut.execute({
        product_id: 'product-1',
        quantity: -1,
      }),
    ).rejects.toThrow(InvalidQuantityError);
  });

  it('should throw ProductStockNotFoundError when stock does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent',
        quantity: 5,
      }),
    ).rejects.toThrow(ProductStockNotFoundError);
  });
});
