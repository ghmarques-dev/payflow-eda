import { Module } from '@nestjs/common';

import { SalesController } from './sales.controller';

import {
  StartSaleUseCase,
  AddItemToSaleUseCase,
  RemoveItemFromSaleUseCase,
  ApplyDiscountToSaleUseCase,
  CheckoutSaleUseCase,
} from '@/application/use-cases';

import { DatabaseModule } from '@/infra/database';
import { EnvService } from '@/infra/env';
import { MessagingModule } from '@/infra/messaging';

@Module({
  imports: [
    DatabaseModule,
    MessagingModule
  ],
  controllers: [SalesController],
  providers: [
    EnvService,

    StartSaleUseCase,
    AddItemToSaleUseCase,
    RemoveItemFromSaleUseCase,
    ApplyDiscountToSaleUseCase,
    CheckoutSaleUseCase,
  ],
})
export class ControllersModule {}
