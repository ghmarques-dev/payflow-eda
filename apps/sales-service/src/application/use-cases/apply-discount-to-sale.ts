import { Injectable } from '@nestjs/common';

import type { SalesRepository } from '@/domain/repositories/database';
import { SaleNotFoundError } from '../errors';
import { SaleNotInDraftStatusError } from '../errors/errors';
import { InvalidDiscountError } from '../errors/errors';

export type IApplyDiscountToSaleUseCaseInput = {
  sale_id: string;
  discountInCents: number;
};

export type IApplyDiscountToSaleUseCaseOutput = void;

@Injectable()
export class ApplyDiscountToSaleUseCase {
  constructor(
    private readonly salesRepository: SalesRepository
  ) {}

  async execute(input: IApplyDiscountToSaleUseCaseInput): Promise<IApplyDiscountToSaleUseCaseOutput> {
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

    if (input.discountInCents < 0) {
      throw new InvalidDiscountError('Discount cannot be negative');
    }

    const subtotalInCents = saleExists.subtotalInCents ?? 0;

    if (input.discountInCents > subtotalInCents) {
      throw new InvalidDiscountError('Discount cannot be greater than subtotal');
    }

    const newTotalInCents = subtotalInCents - input.discountInCents;

    await this.salesRepository.update({
      sale_id: input.sale_id,
      data: {
        discountInCents: input.discountInCents,
        totalInCents: newTotalInCents,
      },
    });
  }
}
