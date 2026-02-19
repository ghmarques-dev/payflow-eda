import { Module } from '@nestjs/common';

import { ProductsController } from './products.controller';
import { ProductStockController } from './product-stock.controller';

import {
  CreateProductUseCase,
  UpdateProductUseCase,
  CreateStockForProductUseCase,
  AddStockUseCase,
  ConfirmReservationUseCase,
  GetProductStockByProductIdUseCase,
  ActivateProductUseCase,
  DeactivateProductUseCase,
  ReserveStockUseCase,
} from '@/application/use-cases';
import { SkuGeneratorService } from '@/application/services';

import { DatabaseModule } from '@/infra/database';
import { EnvService } from '@/infra/env';
import { SkuGenerator } from '@/domain/services';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController, ProductStockController],
  providers: [
    EnvService,
    {
      provide: SkuGenerator,
      useClass: SkuGeneratorService,
    },
    CreateProductUseCase,
    UpdateProductUseCase,
    CreateStockForProductUseCase,
    AddStockUseCase,
    ReserveStockUseCase,
    ConfirmReservationUseCase,
    GetProductStockByProductIdUseCase,
    ActivateProductUseCase,
    DeactivateProductUseCase,
  ],
})
export class ControllersModule {}
