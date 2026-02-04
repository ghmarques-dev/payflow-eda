import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { PrismaUsersRepository } from './prisma/prisma-users-repository';

import { UsersRepository } from '@/domain/repositories';

@Module({
  providers: [
    PrismaService,
    { 
      provide: UsersRepository, 
      useClass: PrismaUsersRepository 
    },
  ],
  exports: [
    PrismaService,
    UsersRepository,
  ],
})
export class DatabaseModule {}