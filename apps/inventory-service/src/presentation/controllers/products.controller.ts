import { z } from 'zod';
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/pipes';
import {
  HttpCreatedResponse,
  HttpSuccessResponse,
} from '@/presentation/helpers';
import { ControllerErrorHandlerDecorator } from '@/presentation/decorators';
import {
  CreateProductUseCase,
  UpdateProductUseCase,
  ActivateProductUseCase,
  DeactivateProductUseCase,
} from '@/application/use-cases';
import { ProductPresenter } from '../presenters';

const createProductSchema = z.object({
  store_id: z.string(),
  name: z.string(),
  description: z.string(),
  price_in_cents: z.number().nonnegative(),
  is_active: z.boolean().optional()
});

type CreateProductSchema = z.infer<typeof createProductSchema>;

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price_in_cents: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

type UpdateProductSchema = z.infer<typeof updateProductSchema>;

@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly activateProductUseCase: ActivateProductUseCase,
    private readonly deactivateProductUseCase: DeactivateProductUseCase,
  ) {}

  @Post()
  @ControllerErrorHandlerDecorator()
  async createProduct(
    @Body(new ZodValidationPipe(createProductSchema)) body: CreateProductSchema,
  ) {
    const response = await this.createProductUseCase.execute(body);
    return HttpCreatedResponse(ProductPresenter.toHTTP(response));
  }

  @Patch(':product_id')
  @ControllerErrorHandlerDecorator()
  async updateProduct(
    @Param('product_id') product_id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductSchema,
  ) {
    const response = await this.updateProductUseCase.execute({
      product_id,
      ...body,
    });
    return HttpSuccessResponse(ProductPresenter.toHTTP(response));
  }

  @Post(':product_id/activate')
  @ControllerErrorHandlerDecorator()
  async activateProduct(@Param('product_id') product_id: string) {
    const response = await this.activateProductUseCase.execute({ product_id });
    return HttpSuccessResponse(ProductPresenter.toHTTP(response));
  }

  @Post(':product_id/deactivate')
  @ControllerErrorHandlerDecorator()
  async deactivateProduct(@Param('product_id') product_id: string) {
    const response = await this.deactivateProductUseCase.execute({ product_id });
    return HttpSuccessResponse(ProductPresenter.toHTTP(response));
  }
}
