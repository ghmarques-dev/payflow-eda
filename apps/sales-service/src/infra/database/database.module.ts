import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import { PrismaSalesRepository, PrismaSaleItemsRepository } from './prisma';

import { SaleItemsRepository, SalesRepository } from '@/domain/repositories';

import { EnvModule } from '../env';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: SalesRepository,
      useClass: PrismaSalesRepository,
    },
    {
      provide: SaleItemsRepository,
      useClass: PrismaSaleItemsRepository,
    },
  ],
  exports: [
    PrismaService, 
    SalesRepository, 
    SaleItemsRepository
  ],
})
export class DatabaseModule {}
