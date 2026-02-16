import { InMemorySalesRepository, InMemorySaleItemsRepository } from '../repositories/database';

import { SalesRepository } from '@/domain/repositories';
import { SaleItemsRepository } from '@/domain/repositories/database';

import { CheckoutSaleUseCase } from './checkout-sale';
import { SaleNotFoundError } from '../errors';
import { 
  SaleNotInDraftStatusError,
  SaleWithoutItemsError,
  SaleWithInvalidTotalError
} from '../errors/errors';

import { InMemoryEventPublisher } from '@/infra/messaging';

let salesRepository: SalesRepository;
let saleItemsRepository: SaleItemsRepository;
let eventPublisher: InMemoryEventPublisher;
let sut: CheckoutSaleUseCase;

describe('checkout sale use case', () => {
  beforeEach(async () => {
    salesRepository = new InMemorySalesRepository();
    saleItemsRepository = new InMemorySaleItemsRepository();
    eventPublisher = new InMemoryEventPublisher();

    sut = new CheckoutSaleUseCase(salesRepository, saleItemsRepository, eventPublisher);
  });

  it('should be able to checkout sale', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 2000,
        total_in_cents: 2000,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
    });

    const updatedSale = await salesRepository.findById({
      sale_id: sale.sale_id,
    });

    expect(updatedSale?.status).toBe('CHECKOUT_PENDING');
  });

  it('should be able to publish SaleCheckoutRequestedEvent', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 2000,
        discount_in_cents: 200,
        total_in_cents: 1800,
      },
    });

    await sut.execute({
      sale_id: sale.sale_id,
    });

    const publishedEvents = eventPublisher.publishedEvents;

    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].event_type).toBe('sale.checkout_requested');
    expect(publishedEvents[0].payload).toEqual({
      sale_id: sale.sale_id,
      items: [
        {
          sale_item_id: saleItem.sale_item_id,
          product_id: 'product-123',
          quantity: 2,
          unit_price_in_cents: 1000,
        },
      ],
      occurred_at: expect.any(Date),
    });
  });

  it('should not be able to checkout non-existent sale', async () => {
    await expect(
      sut.execute({
        sale_id: 'non-existent-sale-id',
      }),
    ).rejects.toThrow(SaleNotFoundError);
  });

  it('should not be able to checkout sale that is not in DRAFT status', async () => {
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
      }),
    ).rejects.toThrow(SaleNotInDraftStatusError);
  });

  it('should not be able to checkout sale without items', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 0,
        total_in_cents: 0,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
      }),
    ).rejects.toThrow(SaleWithoutItemsError);
  });

  it('should not be able to checkout sale with total equal to zero', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 1,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 1000,
        discount_in_cents: 1000,
        total_in_cents: 0,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
      }),
    ).rejects.toThrow(SaleWithInvalidTotalError);
  });

  it('should not be able to checkout sale with negative total', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 1,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 1000,
        discount_in_cents: 1500,
        total_in_cents: -500,
      },
    });

    await expect(
      sut.execute({
        sale_id: sale.sale_id,
      }),
    ).rejects.toThrow(SaleWithInvalidTotalError);
  });

  it('should be able salesRepository update call with correct status', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 2000,
        total_in_cents: 2000,
      },
    });

    const salesRepositorySpy = jest.spyOn(salesRepository, 'update');

    await sut.execute({
      sale_id: sale.sale_id,
    });

    expect(salesRepositorySpy).toHaveBeenCalledWith({
      sale_id: sale.sale_id,
      data: {
        status: 'CHECKOUT_PENDING',
      },
    });
  });

  it('should be able eventPublisher publish call with correct event', async () => {
    const sale = await salesRepository.createDraft({
      operator_id: '123',
      store_id: '456',
      status: 'DRAFT',
    });

    const saleItem = await saleItemsRepository.create({
      sale_id: sale.sale_id,
      product_id: 'product-123',
      quantity: 2,
      unit_price_in_cents: 1000,
    });

    await salesRepository.update({
      sale_id: sale.sale_id,
      data: {
        subtotal_in_cents: 2000,
        discount_in_cents: 200,
        total_in_cents: 1800,
      },
    });

    const eventPublisherSpy = jest.spyOn(eventPublisher, 'publish');

    await sut.execute({
      sale_id: sale.sale_id,
    });

    expect(eventPublisherSpy).toHaveBeenCalledTimes(1);

    const publishedEvent = eventPublisherSpy.mock.calls[0][0] as any;

    expect(publishedEvent.event_type).toBe('sale.checkout_requested');
    expect(publishedEvent.payload.sale_id).toBe(sale.sale_id);
    expect(publishedEvent.payload.items).toHaveLength(1);
    expect(publishedEvent.payload.items[0].product_id).toBe('product-123');
    expect(publishedEvent.payload.items[0].sale_item_id).toBe(saleItem.sale_item_id);
    expect(publishedEvent.payload.items[0].quantity).toBe(2);
    expect(publishedEvent.payload.items[0].unit_price_in_cents).toBe(1000);
    expect(publishedEvent.payload.occurred_at).toBeInstanceOf(Date);
  });
});
