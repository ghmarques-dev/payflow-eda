import type { Sale, SaleStatus } from '../../entities';

export abstract class SalesRepository {
  abstract createDraft(
    input: SalesRepository.CreateDraft.Input
  ): Promise<SalesRepository.CreateDraft.Output>;

  abstract update(
    input: SalesRepository.Update.Input
  ): Promise<SalesRepository.Update.Output>;

  abstract findById(
    input: SalesRepository.FindById.Input
  ): Promise<SalesRepository.FindById.Output>;
}

export namespace SalesRepository {
  export namespace CreateDraft {
    export type Input = {
      sale_id?: string;
      operator_id: string;
      store_id: string;
      status: SaleStatus;
    };

    export type Output = Sale;
  }

  export namespace Update {
    export type Input = {
      sale_id: string;
      data: Partial<Omit<Sale, 'sale_id' | 'created_at'>>;
    };

    export type Output = Sale;
  }

  export namespace FindById {
    export type Input = {
      sale_id: string;
    };

    export type Output = Sale | null;
  }
}
