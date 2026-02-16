import { InMemorySalesRepository, InMemorySaleItemsRepository } from '../repositories/database';

import { SalesRepository } from '@/domain/repositories';
import { SaleItemsRepository } from '@/domain/repositories/database';

import { AddItemToSaleUseCase } from './add-item-to-sale';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError } from '../errors/errors';

let salesRepository: SalesRepository;
let saleItemsRepository: SaleItemsRepository;
let sut: AddItemToSaleUseCase;

describe('add item to sale use case', () => {
  beforeEach(async () => {
    salesRepository = new InMemorySalesRepository();
    saleItemsRepository = new InMemorySaleItemsRepository();

    sut = new AddItemToSaleUseCase(salesRepository, saleItemsRepository);
  });

  it('should be able to add item to sale', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const response = await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    expect(response).toEqual(
      expect.objectContaining({
        sale_item_id: expect.any(String),
        sale_id: sale.sale_id,
        product_id: 'product-123',
        quantity: 2,
        unit_price_in_cents: 1000,
        created_at: expect.any(Date),
      }),
    );
  });

  it('should be able to update sale subtotal when adding item', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.subtotal_in_cents).toBe(2000);
  });

  it('should be able to accumulate subtotal when adding multiple items', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-456',
      quantity: 3,
      unit_price_in_cents: 500,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.subtotal_in_cents).toBe(3500);
  });

  it('should not be able to add item to non-existent sale', async () => {
    await expect(
      sut.execute({
        sale_id: 'non-existent-sale-id',
        product_id: 'product-123',
        quantity: 2,
        unit_price_in_cents: 1000,
      }),
    ).rejects.toThrow(SaleNotFoundError);
  });

  it('should not be able to add item to sale that is not in DRAFT status', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        status: 'COMPLETED',
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        product_id: 'product-123',
        quantity: 2,
        unit_price_in_cents: 1000,
      }),
    ).rejects.toThrow(SaleNotInDraftStatusError);
  });

  it('should be able saleItemsRepository call with correct values', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItemsRepositorySpy = jest.spyOn(saleItemsRepository, 'create');

    await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    expect(saleItemsRepositorySpy).toHaveBeenCalledWith({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });
  });

  it('should be able salesRepository update call with correct subtotal', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const salesRepositorySpy = jest.spyOn(salesRepository, 'update');

    await sut.execute({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    expect(salesRepositorySpy).toHaveBeenCalledWith({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 2000,
        total_in_cents: 2000,
      },
    });
  });
});
