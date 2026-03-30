import { registerTracing } from '@payflow/telemetry';

registerTracing({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'sales-service',
});
