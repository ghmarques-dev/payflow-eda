import { Injectable } from '@nestjs/common';

import {
  SaleItemsRepository,
  SalesRepository,
} from '@/domain/repositories/database';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError, SaleItemNotFoundError } from '../errors/errors';

export type IRemoveItemFromSaleUseCaseInput = {
  sale_id: string;
  sale_item_id: string;
};

export type IRemoveItemFromSaleUseCaseOutput = void;

@Injectable()
export class RemoveItemFromSaleUseCase {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly saleItemsRepository: SaleItemsRepository
  ) {}

  async execute(input: IRemoveItemFromSaleUseCaseInput): Promise<IRemoveItemFromSaleUseCaseOutput> {
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

    const saleItem = await this.saleItemsRepository.findById({
      sale_item_id: input.sale_item_id,
    });

    if (!saleItem) {
      throw new SaleItemNotFoundError();
    }

    if (saleItem.sale_id !== input.sale_id) {
      throw new SaleItemNotFoundError();
    }

    await this.saleItemsRepository.delete({
      sale_item_id: input.sale_item_id,
    });

    const itemValueInCents = saleItem.unit_price_in_cents * saleItem.quantity;
    const newSubtotalInCents = 
      (saleExists.subtotal_in_cents ?? 0) - itemValueInCents;

    await this.salesRepository.update({
      sale_id: input.sale_id,
      data: {
        subtotal_in_cents: Math.max(0, newSubtotalInCents),
      },
    });
  }
}
