import type { SaleItem } from "@/domain/entities";

export abstract class SaleItemsRepository {
  abstract create(
    input: SaleItemsRepository.Create.Input
  ): Promise<SaleItemsRepository.Create.Output>;

  abstract update(
    input: SaleItemsRepository.Update.Input
  ): Promise<SaleItemsRepository.Update.Output>;

  abstract findById(
    input: SaleItemsRepository.FindById.Input
  ): Promise<SaleItemsRepository.FindById.Output>;

  abstract delete(
    input: SaleItemsRepository.Delete.Input
  ): Promise<SaleItemsRepository.Delete.Output>;

  abstract findBySaleId(
    input: SaleItemsRepository.FindBySaleId.Input
  ): Promise<SaleItemsRepository.FindBySaleId.Output>;
}

export namespace SaleItemsRepository {
  export namespace Create {
    export type Input = {
      sale_item_id?: string;
      sale_id: string;
      product_id: string;
      quantity: number;
      unit_price_in_cents: number;
    };

    export type Output = SaleItem;
  }

  export namespace Update {
    export type Input = {
      sale_item_id: string;
      data: Partial<SaleItem>;
    };

    export type Output = SaleItem;
  }

  export namespace FindById {
    export type Input = {
      sale_item_id: string;
    };

    export type Output = SaleItem | null;
  }

  export namespace Delete {
    export type Input = {
      sale_item_id: string;
    };

    export type Output = void;
  }

  export namespace FindBySaleId {
    export type Input = {
      sale_id: string;
    };

    export type Output = SaleItem[];
  }
}
