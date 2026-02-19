import {
  InMemoryProductRepository,
  InMemoryProductStockRepository,
} from '../repositories/database';
import { CreateStockForProductUseCase } from './create-stock-for-product';
import {
  ProductNotFoundError,
  ProductStockAlreadyExistsError,
} from '@/application/errors';

let productRepository: InMemoryProductRepository;
let productStockRepository: InMemoryProductStockRepository;
let sut: CreateStockForProductUseCase;

describe('create stock for product use case', () => {
  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    productStockRepository = new InMemoryProductStockRepository();
    sut = new CreateStockForProductUseCase(
      productRepository,
      productStockRepository,
    );

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

  it('should be able to create stock for a product', async () => {
    const [product] = productRepository.items;

    const result = await sut.execute({
      product_id: product.product_id,
      available_quantity: 10,
      reserved_quantity: 5,
    });

    expect(result).toMatchObject({
      product_id: product.product_id,
      available_quantity: 10,
      reserved_quantity: 5,
    });
    expect(result.product_stock_id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should call productRepository.findById with correct values', async () => {
    const productRepositoryFindByIdSpy = jest.spyOn(productRepository, 'findById');

    await sut.execute({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 5,
    });

    expect(productRepositoryFindByIdSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should throw ProductNotFoundError when product does not exist', async () => {
    await expect(
      sut.execute({
        product_id: 'non-existent-product',
        available_quantity: 10,
        reserved_quantity: 5,
      }),
    ).rejects.toThrow(ProductNotFoundError);
  });


  it('should call productStockRepository.findByProductId with correct values', async () => {
    const productStockRepositoryFindByProductIdSpy = jest.spyOn(productStockRepository, 'findByProductId');

    await sut.execute({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 5,
    });

    expect(productStockRepositoryFindByProductIdSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
    });
  });

  it('should throw ProductStockAlreadyExistsError when stock already exists', async () => {
    const [product] = productRepository.items;

    await sut.execute({
      product_id: product.product_id,
      available_quantity: 10,
      reserved_quantity: 5,
    });

    await expect(
      sut.execute({
        product_id: product.product_id,
        available_quantity: 10,
        reserved_quantity: 5,
      }),
    ).rejects.toThrow(ProductStockAlreadyExistsError);
  });

  it('should call productStockRepository.create with correct values', async () => {
    const productStockRepositoryCreateSpy = jest.spyOn(productStockRepository, 'create');

    await sut.execute({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 5,
    });

    expect(productStockRepositoryCreateSpy).toHaveBeenCalledWith({
      product_id: 'product-1',
      available_quantity: 10,
      reserved_quantity: 5,
    });
  });
});
