import type { SupportedLocale } from "@/types/common";

/* ---------- enums/aliases ---------- */
export type CurrencyCode = "USD" | "EUR" | "TRY";

/** Güncel dönemler */
export type BillingPeriod =
  | "weekly"
  | "ten_days"
  | "fifteen_days"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "once";

export type PriceListStatus = "draft" | "active" | "archived";

/** Backend ile birebir: locale → string (optional) */
export type TranslatedLabel = Partial<Record<SupportedLocale, string>>;

/* ---------- core models ---------- */
export interface IPriceList {
  _id: string;                  // mongo id (string)
  tenant: string;
  code: string;                 // UPPER_SNAKE
  name: TranslatedLabel;        // boş locale'ler "" olabilir
  description?: TranslatedLabel;

  defaultCurrency: CurrencyCode;
  segment?: string;
  region?: string;
  categoryIds?: string[];       // ObjectId string[]

  effectiveFrom: string | Date;
  effectiveTo?: string | Date;

  status: PriceListStatus;      // draft|active|archived
  isActive: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IPriceListItem {
  _id: string;
  tenant: string;
  listId: string;               // ref: pricelist._id
  serviceCode: string;          // UPPER_SNAKE
  amount: number;               // >= 0
  currency?: CurrencyCode;      // verilmezse backend list.defaultCurrency'yi setler
  period: BillingPeriod;
  notes?: string;

  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* ---------- filters & compound ---------- */
export interface PriceListAdminFilters {
  q?: string;
  status?: PriceListStatus;
  isActive?: boolean;
  region?: string;
  segment?: string;
  effectiveAt?: string; // YYYY-MM-DD
}

export interface PriceListItemAdminFilters {
  serviceCode?: string;
  period?: BillingPeriod;
  isActive?: boolean;
}

export interface PriceListWithItems {
  list: IPriceList;
  items: IPriceListItem[];
}
