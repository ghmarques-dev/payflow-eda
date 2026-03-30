import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | null = null;

function resolveOtlpTracesUrl(): string | undefined {
  const explicit = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim();
  if (explicit) return explicit;

  const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
  if (!base) return undefined;

  const normalized = base.replace(/\/$/, '');
  return normalized.endsWith('/v1/traces')
    ? normalized
    : `${normalized}/v1/traces`;
}

export function registerTracing(options: { serviceName: string }): void {
  if (process.env.OTEL_TRACING_ENABLED === 'false') {
    return;
  }

  if (sdk != null) {
    return;
  }

  const url = resolveOtlpTracesUrl();
  
  if (!url) {
    console.warn(
      '[@payflow/telemetry] OTLP endpoint not set (OTEL_EXPORTER_OTLP_ENDPOINT or OTEL_EXPORTER_OTLP_TRACES_ENDPOINT); tracing disabled',
    );
    return;
  }

  const traceExporter = new OTLPTraceExporter({ url });

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: options.serviceName,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    void sdk
      ?.shutdown()
      .catch(() => undefined)
      .finally(() => {
        sdk = null;
      });
  };

  process.once('SIGTERM', shutdown);
}
