import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().optional().default(3334),
  RABBITMQ_URL: z.string(),
  OTEL_SERVICE_NAME: z.string().optional().default("inventory-service"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().optional(),
  OTEL_TRACING_ENABLED: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
