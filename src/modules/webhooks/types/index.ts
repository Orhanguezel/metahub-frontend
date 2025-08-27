// frontend/modules/webhooks/types.ts


/* ============= Ortak Yardımcılar (opsiyonel) ============= */
/** Standart API zarfı */
export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: { page?: number; limit?: number; total?: number };
};

/* ============= Webhooks Tipleri (FE) ============= */

export type WebhookEvent =
  | "order.created"
  | "order.status.changed"
  | "payment.created"
  | "payment.refunded"
  | "promotion.redeemed"
  | "coupon.created"
  | "coupon.updated"
  | "menuitem.updated"
  | "system.ping" // test için
  | "*";

export type RetryStrategy = "fixed" | "exponential";

export interface IWebhookHeaderKV {
  key: string;
  value: string;
}

export interface IWebhookSigning {
  algorithm: "HMAC-SHA256";
  headerName: string;          // örn: "x-mh-signature"
  timestampHeaderName: string; // örn: "x-mh-timestamp"
  version?: "v1";
  timestampSkewSec?: number;   // varsayılan: 300s
}

export interface IWebhookRetryPolicy {
  maxAttempts: number;      // 1..10
  strategy: RetryStrategy;  // fixed | exponential
  baseBackoffSec: number;   // fixed: sabit; exponential: 2^n * base
  timeoutMs?: number;       // HTTP timeout
}

/** Endpoint (API shape - FE) */
export interface IWebhookEndpointFE {
  _id: string;

  tenant: string;
  name: string;
  description?: string;
  targetUrl: string;              // https://...
  httpMethod: "POST" | "PUT";
  isActive: boolean;
  events: WebhookEvent[];
  secret?: string;                // create/get dönebilir
  headers?: IWebhookHeaderKV[];
  verifySSL?: boolean;
  signing: IWebhookSigning;
  retry: IWebhookRetryPolicy;

  lastDeliveredAt?: string;       // ISO
  lastStatus?: number;

  createdAt: string;              // ISO
  updatedAt: string;              // ISO
}

/** Delivery (API shape - FE) */
export interface IWebhookDeliveryFE {
  _id: string;

  tenant: string;
  endpointRef: string;         // ObjectId (string)
  eventType: string;
  payload?: any;
  attempt: number;
  success: boolean;

  requestHeaders: Record<string, string>;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  durationMs?: number;

  createdAt: string;           // ISO
  updatedAt: string;           // ISO
}

/* ============= Payload & Query Tipleri ============= */

/** CREATE */
export type WebhookEndpointCreatePayload = {
  name: string;
  targetUrl: string;
  httpMethod?: "POST" | "PUT";
  events?: WebhookEvent[];
  isActive?: boolean;
  secret?: string;
  headers?: IWebhookHeaderKV[];    // [{key,value}]
  verifySSL?: boolean;
  signing?: Partial<IWebhookSigning>;
  retry?: Partial<IWebhookRetryPolicy>;
  description?: string;
};

/** UPDATE (PUT) */
export type WebhookEndpointUpdatePayload = Partial<
  Omit<
    WebhookEndpointCreatePayload,
    // güncellenebilir ama create’e eş; explicit kalsın
    never
  >
> & {
  rotateSecret?: boolean;
};

/** LIST /endpoints query */
export type WebhookEndpointListParams = {
  q?: string;
  isActive?: boolean | string;
  event?: string;
  limit?: number | string; // BE: 1..500
};

/** LIST /deliveries query */
export type WebhookDeliveryListParams = {
  endpointRef?: string;
  eventType?: string;
  success?: boolean | string;
  from?: string; // ISO
  to?: string;   // ISO
  limit?: number | string; // 1..500
};

/** /deliveries/:id/retry */
export type WebhookRetryResponse = {
  deliveryId?: string;
};

/** /test payload — endpointRef veya targetUrl zorunlu (birisi) */
export type WebhookTestSendPayload = {
  endpointRef?: string;
  targetUrl?: string;
  eventType?: string; // varsayılan: system.ping
};

