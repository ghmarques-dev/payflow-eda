import type { ProductStock } from '@/domain/entities';

export abstract class ProductStockRepository {
  abstract create(
    input: ProductStockRepository.Create.Input,
  ): Promise<ProductStockRepository.Create.Output>;

  abstract update(
    input: ProductStockRepository.Update.Input,
  ): Promise<ProductStockRepository.Update.Output>;

  abstract findById(
    input: ProductStockRepository.FindById.Input,
  ): Promise<ProductStockRepository.FindById.Output>;

  abstract findByProductId(
    input: ProductStockRepository.FindByProductId.Input,
  ): Promise<ProductStockRepository.FindByProductId.Output>;
}

export namespace ProductStockRepository {
  export namespace Create {
    export type Input = {
      product_stock_id?: string;
      product_id: string;
      available_quantity: number;
      reserved_quantity: number;
    };

    export type Output = ProductStock;
  }

  export namespace Update {
    export type Input = {
      product_stock_id: string;
      available_quantity: number;
      reserved_quantity: number;
    };

    export type Output = ProductStock;
  }

  export namespace FindById {
    export type Input = {
      product_stock_id: string;
    };

    export type Output = ProductStock | null;
  }

  export namespace FindByProductId {
    export type Input = {
      product_id: string;
    };

    export type Output = ProductStock | null;
  }
}
