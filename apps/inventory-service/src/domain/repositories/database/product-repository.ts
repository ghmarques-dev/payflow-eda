import type { Product } from '@/domain/entities';

export abstract class ProductRepository {
  abstract create(
    input: ProductRepository.Create.Input,
  ): Promise<ProductRepository.Create.Output>;

  abstract update(
    input: ProductRepository.Update.Input,
  ): Promise<ProductRepository.Update.Output>;

  abstract findById(
    input: ProductRepository.FindById.Input,
  ): Promise<ProductRepository.FindById.Output>;
}

export namespace ProductRepository {
  export namespace Create {
    export type Input = {
      product_id?: string;
      store_id: string;
      name: string;
      description: string;
      price_in_cents: number;
      is_active: boolean;
      sku: string;
    };

    export type Output = Product;
  }

  export namespace Update {
    export type Input = {
      product_id: string;

      name?: string;
      description?: string;
      price_in_cents?: number;
      is_active?: boolean;
      sku?: string;
    };

    export type Output = Product;
  }

  export namespace FindById {
    export type Input = {
      product_id: string;
    };

    export type Output = Product | null;
  }
}
