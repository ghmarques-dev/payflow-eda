export { 
  context, 
  SpanStatusCode, 
  trace,
} from '@opentelemetry/api';

export { registerTracing } from './register-tracing';
export { extractContextFromHeaders, injectTraceContext } from './amqp-headers';
