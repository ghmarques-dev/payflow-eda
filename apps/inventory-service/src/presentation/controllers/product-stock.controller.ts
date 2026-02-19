import { z } from 'zod';
import {
  Body,
  Controller,
  Patch,
  Post,
  Get,
  Param,
} from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/pipes';
import {
  HttpCreatedResponse,
  HttpSuccessResponse,
} from '@/presentation/helpers';
import { ControllerErrorHandlerDecorator } from '@/presentation/decorators';
import {
  CreateStockForProductUseCase,
  AddStockUseCase,
  ReserveStockUseCase,
  ConfirmReservationUseCase,
  GetProductStockByProductIdUseCase,
} from '@/application/use-cases';
import { ProductStockPresenter } from '../presenters';

const createStockForProductSchema = z.object({
  product_id: z.string(),
  available_quantity: z.coerce.number().nonnegative(),
  reserved_quantity: z.coerce.number().nonnegative().optional(),
});

type CreateStockForProductSchema = z.infer<typeof createStockForProductSchema>;

const quantitySchema = z.object({
  quantity: z.coerce.number().positive(),
});

type QuantitySchema = z.infer<typeof quantitySchema>;

const reserveStockSchema = z.object({
  quantity: z.coerce.number().positive(),
});

type ReserveStockSchema = z.infer<typeof reserveStockSchema>;

const confirmReservationSchema = z.object({
  quantity: z.coerce.number().positive(),
});

type ConfirmReservationSchema = z.infer<typeof confirmReservationSchema>;

@Controller('stocks')
export class ProductStockController {
  constructor(
    private readonly createStockForProductUseCase: CreateStockForProductUseCase,
    private readonly addStockUseCase: AddStockUseCase,
    private readonly reserveStockUseCase: ReserveStockUseCase,
    private readonly confirmReservationUseCase: ConfirmReservationUseCase,
    private readonly getProductStockByProductIdUseCase: GetProductStockByProductIdUseCase,
  ) {}

  @Post()
  @ControllerErrorHandlerDecorator()
  async createStockForProduct(
    @Body(new ZodValidationPipe(createStockForProductSchema))
      body: CreateStockForProductSchema,
  ) {
    const response = await this.createStockForProductUseCase.execute({
      product_id: body.product_id,
      available_quantity: body.available_quantity,
      reserved_quantity: body.reserved_quantity ?? 0,
    });
    return HttpCreatedResponse(ProductStockPresenter.toHTTP(response));
  }

  @Get('product/:product_id')
  @ControllerErrorHandlerDecorator()
  async getStockByProductId(@Param('product_id') product_id: string) {
    const response = await this.getProductStockByProductIdUseCase.execute({
      product_id,
    });
    return HttpSuccessResponse(ProductStockPresenter.toHTTP(response));
  }

  @Patch('product/:product_id/add')
  @ControllerErrorHandlerDecorator()
  async addStock(
    @Param('product_id') product_id: string,
    @Body(new ZodValidationPipe(quantitySchema)) body: QuantitySchema,
  ) {
    const response = await this.addStockUseCase.execute({
      product_id,
      quantity: body.quantity,
    });
    return HttpSuccessResponse(ProductStockPresenter.toHTTP(response));
  }

  @Post('product/:product_id/reserve')
  @ControllerErrorHandlerDecorator()
  async reserveStock(
    @Param('product_id') product_id: string,
    @Body(new ZodValidationPipe(reserveStockSchema)) body: ReserveStockSchema,
  ) {
    const response = await this.reserveStockUseCase.execute({
      product_id,
      quantity: body.quantity,
    });

    return HttpSuccessResponse(ProductStockPresenter.toHTTP(response));
  }

  @Post('product/:product_id/confirm-reservation')
  @ControllerErrorHandlerDecorator()
  async confirmReservation(
    @Param('product_id') product_id: string,
    @Body(new ZodValidationPipe(confirmReservationSchema))
      body: ConfirmReservationSchema,
  ) {
    const response = await this.confirmReservationUseCase.execute({
      product_id,
      quantity: body.quantity,
    });
    return HttpSuccessResponse(ProductStockPresenter.toHTTP(response));
  }
}
