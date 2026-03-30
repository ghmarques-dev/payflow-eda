import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  SALE_CHECKOUT_REQUESTED_EVENT_TYPE,
  type SaleCheckoutRequestedEventPayload,
  type SaleCheckoutItem,
} from '@payflow/contracts';

import { EventSubscriber } from '@/domain/services';
import { ReserveStockUseCase } from '@/application/use-cases';
import {
  ProductStockNotFoundError,
  InsufficientAvailableQuantityError,
  InsufficientReservedQuantityError,
} from '@/application/errors';
import { SpanStatusCode, trace } from '@payflow/telemetry';

const tracer = trace.getTracer('payflow.inventory.events');

@Injectable()
export class SaleCheckoutRequestedHandlerService implements OnModuleInit {
  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly reserveStockUseCase: ReserveStockUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventSubscriber.subscribe({
      routing_key: SALE_CHECKOUT_REQUESTED_EVENT_TYPE,
      handler: (payload) => this.handle(payload as SaleCheckoutRequestedEventPayload),
    });
  }

  private async handle(payload: SaleCheckoutRequestedEventPayload): Promise<void> {
    await tracer.startActiveSpan('SaleCheckoutRequestedHandler.handle', async (root) => {
      root.setAttribute('sale.id', payload.sale_id);
      root.setAttribute('payflow.event_type', SALE_CHECKOUT_REQUESTED_EVENT_TYPE);

      try {
        const items = payload.items as SaleCheckoutItem[];

        for (const item of items) {
          await tracer.startActiveSpan('SaleCheckoutRequestedHandler.reserve_line_item', async (span) => {
            span.setAttribute('sale.id', payload.sale_id);
            span.setAttribute('product.id', item.product_id);
            span.setAttribute('stock.reserve.quantity', item.quantity);

              await this.reserveStockUseCase.execute({
                product_id: item.product_id,
                quantity: item.quantity,
                sale_id: payload.sale_id,
              });

              span.setStatus({ code: SpanStatusCode.OK });
          });
        }

        root.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        root.recordException(error);
        root.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        
        throw err;
      }
    });
  }
}
