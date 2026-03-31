import { Module } from "@nestjs/common";

import { EventSubscriber } from "@/domain/services";
import { ReserveStockUseCase } from "@/application/use-cases";

import { DatabaseModule } from "@/infra/database";
import { EnvModule } from "@/infra/env";

import { RabbitMQEventSubscriber } from "./rabbitmq-event-subscriber";
import { SaleCheckoutRequestedHandlerService } from "./sale-checkout-requested-handler";

@Module({
  imports: [DatabaseModule, EnvModule],
  providers: [
    {
      provide: EventSubscriber,
      useClass: RabbitMQEventSubscriber,
    },
    ReserveStockUseCase,
    SaleCheckoutRequestedHandlerService,
  ],
})
export class SubscriberModule {}
