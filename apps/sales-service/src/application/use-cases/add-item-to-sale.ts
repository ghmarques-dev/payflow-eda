import { Injectable } from '@nestjs/common';

import {
  SaleItemsRepository,
  SalesRepository,
} from '@/domain/repositories/database';
import { SaleItem } from '@/domain/entities';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError } from '../errors/errors';

export type IAddItemToSaleUseCaseInput = {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price_in_cents: number;
};

export type IAddItemToSaleUseCaseOutput = SaleItem;

@Injectable()
export class AddItemToSaleUseCase {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly saleItemsRepository: SaleItemsRepository
  ) {}

  async execute(input: IAddItemToSaleUseCaseInput): Promise<IAddItemToSaleUseCaseOutput> {
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

    const saleItem = await this.saleItemsRepository.create({
      sale_id: input.sale_id,
      product_id: input.product_id,
      quantity: input.quantity,
      unit_price_in_cents: input.unit_price_in_cents,
    });

    const newSubtotalInCents = 
      (saleExists.subtotal_in_cents ?? 0) + (input.unit_price_in_cents * input.quantity);

    await this.salesRepository.update({
      sale_id: input.sale_id,
      data: {
        subtotal_in_cents: newSubtotalInCents,
        total_in_cents: newSubtotalInCents,
      },
    });

    return saleItem;
  }
}
