import { Module } from '@nestjs/common';

import { UsersController } from '@/presentation/controllers/users.controller';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}
