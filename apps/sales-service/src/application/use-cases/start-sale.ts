import { Injectable } from '@nestjs/common';

import type { SalesRepository } from '@/domain/repositories/database';
import type { Sale } from '@/domain/entities';

export type IStartSaleUseCaseInput = {
  operator_id: string;
  store_id: string;
};

export type IStartSaleUseCaseOutput = Sale;

@Injectable()
export class StartSaleUseCase {
  constructor(
    private readonly salesRepository: SalesRepository
  ) {}

  async execute(input: IStartSaleUseCaseInput): Promise<IStartSaleUseCaseOutput> {
    const sale = await this.salesRepository.createDraft({
      operator_id: input.operator_id,
      store_id: input.store_id,
      status: 'DRAFT',
    });

    return sale;
  }
}
