import { z } from 'zod';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/pipes';
import {
  HttpCreatedResponse,
  HttpSuccessResponse,
} from '@/presentation/helpers';
import {
  ControllerErrorHandlerDecorator,
} from '@/presentation/decorators';
import {
  StartSaleUseCase,
  AddItemToSaleUseCase,
  RemoveItemFromSaleUseCase,
  ApplyDiscountToSaleUseCase,
  CheckoutSaleUseCase,
} from '@/application/use-cases';
import { SalesItemPresenter, SalesPresenter } from '../presenters';

const startSaleSchema = z.object({
  operator_id: z.string(),
  store_id: z.string(),
});

type StartSaleSchema = z.infer<typeof startSaleSchema>;

const addItemToSaleBodySchema = z.object({
  product_id: z.string(),
  quantity: z.number().positive(),
  unit_price_in_cents: z.number().nonnegative(),
});

type AddItemToSaleBodySchema = z.infer<typeof addItemToSaleBodySchema>;

const removeItemFromSaleSchema = z.object({
  sale_id: z.string(),
});

type RemoveItemFromSaleSchema = z.infer<typeof removeItemFromSaleSchema>;

const applyDiscountToSaleSchema = z.object({
  discount_in_cents: z.number().nonnegative(),
});

type ApplyDiscountToSaleSchema = z.infer<typeof applyDiscountToSaleSchema>;

@Controller('sales')
export class SalesController {
  constructor(
    private readonly startSaleUseCase: StartSaleUseCase,
    private readonly addItemToSaleUseCase: AddItemToSaleUseCase,
    private readonly removeItemFromSaleUseCase: RemoveItemFromSaleUseCase,
    private readonly applyDiscountToSaleUseCase: ApplyDiscountToSaleUseCase,
    private readonly checkoutSaleUseCase: CheckoutSaleUseCase,
  ) {}

  @Post()
  @ControllerErrorHandlerDecorator()
  async startSale(@Body(new ZodValidationPipe(startSaleSchema)) body: StartSaleSchema) {
    const response = await this.startSaleUseCase.execute({
      operator_id: body.operator_id,
      store_id: body.store_id,
    });

    const sale = SalesPresenter.toHTTP(response);

    return HttpCreatedResponse(sale);
  }

  @Post(':sale_id/items')
  @ControllerErrorHandlerDecorator()
  async addItemToSale(
    @Param('sale_id') sale_id: string,
    @Body(new ZodValidationPipe(addItemToSaleBodySchema)) body: AddItemToSaleBodySchema,
  ) {
    const response = await this.addItemToSaleUseCase.execute({
      sale_id: sale_id,
      product_id: body.product_id,
      quantity: body.quantity,
      unit_price_in_cents: body.unit_price_in_cents,
    });

    const saleItem = SalesItemPresenter.toHTTP(response);

    return HttpCreatedResponse(saleItem);
  }

  @Delete(':sale_id/items/:sale_item_id')
  @ControllerErrorHandlerDecorator()
  async removeItemFromSale(
    @Param('sale_id') sale_id: string,
    @Param('sale_item_id') sale_item_id: string,
  ) {
    await this.removeItemFromSaleUseCase.execute({
      sale_id: sale_id,
      sale_item_id: sale_item_id,
    });

    return HttpSuccessResponse({ message: 'Item removed successfully' });
  }

  @Patch(':sale_id/discount')
  @ControllerErrorHandlerDecorator()
  async applyDiscountToSale(
    @Param('sale_id') sale_id: string,
    @Body(new ZodValidationPipe(applyDiscountToSaleSchema)) body: ApplyDiscountToSaleSchema,
  ) {
    await this.applyDiscountToSaleUseCase.execute({
      sale_id: sale_id,
      discount_in_cents: body.discount_in_cents,
    });

    return HttpSuccessResponse({ message: 'Discount applied successfully' });
  }

  @Post(':sale_id/checkout')
  @ControllerErrorHandlerDecorator()
  async checkoutSale(
    @Param('sale_id') sale_id: string,
  ) {
    await this.checkoutSaleUseCase.execute({
      sale_id: sale_id,
    });

    return HttpSuccessResponse({ message: 'Sale checkout requested successfully' });
  }
}
