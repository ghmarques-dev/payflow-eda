import { context, Context, propagation } from '@opentelemetry/api';

function headerValueToString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return undefined;
}

/** Merge W3C trace context (traceparent / tracestate) into AMQP message headers. */
export function injectTraceContext(
  headers: Record<string, unknown>,
): Record<string, unknown> {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return { ...headers, ...carrier };
}

export function extractContextFromHeaders(
  headers: Record<string, unknown> | undefined,
): Context {
  const carrier: Record<string, string> = {};
  if (headers) {
    for (const [key, raw] of Object.entries(headers)) {
      const asString = headerValueToString(raw);
      
      if (asString !== undefined) {
        carrier[key] = asString;
      }
    }
  }
  return propagation.extract(context.active(), carrier);
}
