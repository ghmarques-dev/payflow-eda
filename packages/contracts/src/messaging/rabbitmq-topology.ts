export const RABBITMQ_EXCHANGE_NAME = 'payflow.events';
export const RABBITMQ_EXCHANGE_TYPE = 'topic';
export const RABBITMQ_MAIN_QUEUE = 'sales';

export const RABBITMQ_DLX_EXCHANGE = 'payflow.events.dlx';
export const RABBITMQ_DLQ_QUEUE = 'sales.dead';
export const RABBITMQ_DLX_ROUTING_KEY = 'sales.dead';

/** Retries after the first failed handling attempt (1 + 3 = 4 deliveries max). */
export const RABBITMQ_MAX_RETRIES = 3;

export const RABBITMQ_RETRY_HEADER = 'x-retry-count';
