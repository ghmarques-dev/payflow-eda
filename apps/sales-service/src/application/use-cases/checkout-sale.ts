import { Injectable } from '@nestjs/common';

import {
  SaleItemsRepository,
  SalesRepository,
} from '@/domain/repositories/database';
import { SaleNotFoundError } from '../errors';
import { 
  SaleNotInDraftStatusError,
  SaleWithoutItemsError,
  SaleWithInvalidTotalError
} from '../errors/errors';
import { EventPublisher } from '../ports';
import { SaleCheckoutRequestedEvent } from '@/domain/events';

export type ICheckoutSaleUseCaseInput = {
  sale_id: string;
};

export type ICheckoutSaleUseCaseOutput = void;

@Injectable()
export class CheckoutSaleUseCase {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly saleItemsRepository: SaleItemsRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: ICheckoutSaleUseCaseInput): Promise<ICheckoutSaleUseCaseOutput> {
    const saleExists = await this.salesRepository.findById({
      sale_id: input.sale_id,
    });

    if (!saleExists) {
      throw new SaleNotFoundError();
    }

    const saleShouldBeDraft = saleExists.status === 'DRAFT';

    if (!saleShouldBeDraft) {
      throw new SaleNotInDraftStatusError();
    }

    const saleItems = await this.saleItemsRepository.findBySaleId({
      sale_id: input.sale_id,
    });

    if (saleItems.length === 0) {
      throw new SaleWithoutItemsError();
    }

    const totalInCents = saleExists.total_in_cents ?? 0;

    if (totalInCents <= 0) {
      throw new SaleWithInvalidTotalError();
    }

    await this.salesRepository.update({
      sale_id: input.sale_id,
      data: {
        status: 'CHECKOUT_PENDING',
      },
    });

    const event = new SaleCheckoutRequestedEvent({
      sale_id: saleExists.sale_id,
      items: saleItems.map(item => ({
        sale_item_id: item.sale_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_in_cents: item.unit_price_in_cents,
      })),
      occurred_at: new Date(),
    } as any);

    await this.eventPublisher.publish(event);
  }
}
