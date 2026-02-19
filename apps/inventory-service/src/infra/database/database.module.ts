import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import {
  PrismaProductRepository,
  PrismaProductStockRepository,
} from './prisma';

import { ProductRepository, ProductStockRepository } from '@/domain/repositories';

import { EnvModule } from '../env';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    {
      provide: ProductStockRepository,
      useClass: PrismaProductStockRepository,
    },
  ],
  exports: [
    PrismaService,
    ProductRepository,
    ProductStockRepository,
  ],
})
export class DatabaseModule {}
