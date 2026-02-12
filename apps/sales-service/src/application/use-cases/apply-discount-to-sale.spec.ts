import { InMemorySalesRepository } from '../repositories/database';

import { SalesRepository } from '@/domain/repositories';

import { ApplyDiscountToSaleUseCase } from './apply-discount-to-sale';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError, InvalidDiscountError } from '../errors/errors';

let salesRepository: SalesRepository;
let sut: ApplyDiscountToSaleUseCase;

describe('apply discount to sale use case', () => {
  beforeEach(async () => {
    salesRepository = new InMemorySalesRepository();

    sut = new ApplyDiscountToSaleUseCase(salesRepository);
  });

  it('should be able to apply discount to sale', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      discountInCents: 200,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.discountInCents).toBe(200);
    expect(updatedSale?.totalInCents).toBe(800);
  });

  it('should be able to apply discount equal to subtotal', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      discountInCents: 1000,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.discountInCents).toBe(1000);
    expect(updatedSale?.totalInCents).toBe(0);
  });

  it('should be able to apply zero discount', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      discountInCents: 0,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.discountInCents).toBe(0);
    expect(updatedSale?.totalInCents).toBe(1000);
  });

  it('should be able to update discount when applying new discount', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
        discountInCents: 100,
        totalInCents: 900,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
      discountInCents: 300,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.discountInCents).toBe(300);
    expect(updatedSale?.totalInCents).toBe(700);
  });

  it('should not be able to apply discount to non-existent sale', async () => {
    await expect(
      sut.execute({
        sale_id: 'non-existent-sale-id',
        discountInCents: 200,
      }),
    ).rejects.toThrow(SaleNotFoundError);
  });

  it('should not be able to apply discount to sale that is not in DRAFT status', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        status: 'COMPLETED',
        subtotalInCents: 1000,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        discountInCents: 200,
      }),
    ).rejects.toThrow(SaleNotInDraftStatusError);
  });

  it('should not be able to apply negative discount', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        discountInCents: -100,
      }),
    ).rejects.toThrow(InvalidDiscountError);
  });

  it('should not be able to apply discount greater than subtotal', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        discountInCents: 1500,
      }),
    ).rejects.toThrow(InvalidDiscountError);
  });

  it('should not be able to apply discount when subtotal is zero', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 0,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
        discountInCents: 100,
      }),
    ).rejects.toThrow(InvalidDiscountError);
  });

  it('should be able salesRepository update call with correct values', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotalInCents: 1000,
      },
    });

    const salesRepositorySpy = jest.spyOn(salesRepository, 'update');

    await sut.execute({
      sale_id: sale.sale_id,
      discountInCents: 200,
    });

    expect(salesRepositorySpy).toHaveBeenCalledWith({
      sale_id: sale.sale_id,
      data: {
        discountInCents: 200,
        totalInCents: 800,
      },
    });
  });
});
