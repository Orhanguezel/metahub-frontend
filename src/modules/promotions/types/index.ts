import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

/** Domain enums (FE) */
export type DiscountType = "percentage" | "fixed" | "free_delivery" | "bxgy";
export type StackingPolicy = "none" | "with_different" | "with_same";
export type PromotionKind = "auto" | "coupon";

/** ---- Rules ---- */
export interface IPromotionRules {
  startsAt?: string | null;  // ISO
  endsAt?: string | null;    // ISO
  minOrder?: { amount: number; currency?: string };
  scope?: {
    branchIds?: string[];
    categoryIds?: string[];
    itemIds?: string[];
    serviceTypes?: Array<"delivery" | "pickup" | "dinein">;
  };
  firstOrderOnly?: boolean;
  usageLimit?: number;     // global
  perUserLimit?: number;   // kullanıcı başına
}

/** ---- Effect ---- */
export interface IPromotionEffect {
  type: DiscountType;
  value?: number;          // percentage(1-100) | fixed(amount)
  currency?: string;       // fixed için
  bxgy?: {
    buyQty: number;
    getQty: number;
    itemScope?: {
      itemIds?: string[];
      categoryIds?: string[];
    };
  };
}

/** ---- Promotion (API shape) ---- */
export interface IPromotion {
  _id: string;
  tenant: string;
  kind: PromotionKind;         // default: "auto"
  code?: string;
  name: TranslatedLabel;
  description?: TranslatedLabel;

  isActive: boolean;
  isPublished: boolean;
  priority: number;            // higher first
  stackingPolicy: StackingPolicy;

  rules: IPromotionRules;
  effect: IPromotionEffect;

  createdAt?: string;          // ISO
  updatedAt?: string;          // ISO
}

/** ---- Redemption ---- */
export interface IPromotionRedemption {
  _id?: string;
  tenant: string;
  promotion: string;           // promotionId
  user?: string | null;
  orderId: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ==== Evaluate API ==== */

export interface ICartItemInput {
  itemId: string;
  categoryId?: string;
  unitPrice: number;
  quantity: number;
}

export interface ICartSnapshot {
  items: ICartItemInput[] | any[]; // bazı entegrasyonlar farklı item şekli gönderebilir
  subtotal: number;
  deliveryFee?: number;
  serviceFee?: number;
  tip?: number;
  currency?: string;            // default TRY
  serviceType?: "delivery" | "pickup" | "dinein";
  branchId?: string;
  userId?: string;
  appliedCode?: string;         // kupon değerlendirmesi için
}

/** Evaluate response (genel bir şema; backend ek alanlar döndürebilir) */
export interface IEvaluateApplied {
  promotionId: string;
  code?: string;
  amount: number;
  description?: string;
}

export interface IEvaluateResult {
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
  applied: IEvaluateApplied[];
  blocked?: Array<{ promotionId?: string; reason: string }>;
  messages?: string[];
}

/** Create/Update payload yardımcı tipleri */
export type PromotionCreatePayload = Omit<
  IPromotion,
  "_id" | "tenant" | "createdAt" | "updatedAt"
>;

export type PromotionUpdatePayload = Partial<PromotionCreatePayload>;
