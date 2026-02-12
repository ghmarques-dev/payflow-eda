import { InMemorySalesRepository, InMemorySaleItemsRepository } from '../repositories/database';

import { SalesRepository } from '@/domain/repositories';
import { SaleItemsRepository } from '@/domain/repositories/database';

import { RemoveItemFromSaleUseCase } from './remove-item-from-sale';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError, SaleItemNotFoundError } from '../errors/errors';

let salesRepository: SalesRepository;
let saleItemsRepository: SaleItemsRepository;
let sut: RemoveItemFromSaleUseCase;

describe('remove item from sale use case', () => {
  beforeEach(async () => {
    salesRepository = new InMemorySalesRepository();
    saleItemsRepository = new InMemorySaleItemsRepository();

    sut = new RemoveItemFromSaleUseCase(salesRepository, saleItemsRepository);
  });

  it('should be able to remove item from sale', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 2000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      sale_item_id: saleItem.sale_item_id,
    });

    const removedItem = await saleItemsRepository.findById({
      sale_item_id: saleItem.sale_item_id,
    });

    expect(removedItem).toBeNull();
  });

  it('should be able to update sale subtotal when removing item', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 2000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      sale_item_id: saleItem.sale_item_id,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.subtotalInCents).toBe(0);
  });

  it('should be able to update subtotal correctly when removing one of multiple items', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem1 = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    const saleItem2 = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-456',
      quantity: 3,
      unitPriceInCents: 500,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 3500,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      sale_item_id: saleItem1.sale_item_id,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.subtotalInCents).toBe(1500);
  });

  it('should not be able to remove item from non-existent sale', async () => {
    const saleItem = await saleItemsRepository.create({
      sale_id: 'sale-123',
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await expect(
      sut.execute({
        sale_id: 'non-existent-sale-id',
        sale_item_id: saleItem.sale_item_id,
      }),
    ).rejects.toThrow(SaleNotFoundError);
  });

  it('should not be able to remove item from sale that is not in DRAFT status', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
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
        sale_item_id: saleItem.sale_item_id,
      }),
    ).rejects.toThrow(SaleNotInDraftStatusError);
  });

  it('should not be able to remove non-existent item', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        sale_item_id: 'non-existent-item-id',
      }),
    ).rejects.toThrow(SaleItemNotFoundError);
  });

  it('should not be able to remove item that belongs to different sale', async () => {
    const sale1 = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const sale2 = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale1.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await expect(
      sut.execute({
        sale_id: sale2.sale_id,
        sale_item_id: saleItem.sale_item_id,
      }),
    ).rejects.toThrow(SaleItemNotFoundError);
  });

  it('should be able saleItemsRepository delete call with correct values', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 2000,
      },
    });

    const saleItemsRepositorySpy = jest.spyOn(saleItemsRepository, 'delete');

    await sut.execute({
      sale_id: sale.sale_id,
      sale_item_id: saleItem.sale_item_id,
    });

    expect(saleItemsRepositorySpy).toHaveBeenCalledWith({
      sale_item_id: saleItem.sale_item_id,
    });
  });

  it('should be able salesRepository update call with correct subtotal', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unitPriceInCents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 2000,
      },
    });

    const salesRepositorySpy = jest.spyOn(salesRepository, 'update');

    await sut.execute({
      sale_id: sale.sale_id,
      sale_item_id: saleItem.sale_item_id,
    });

    expect(salesRepositorySpy).toHaveBeenCalledWith({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 0,
      },
    });
  });
});
