import type { SupportedLocale } from "@/types/common";

/** i18n alanı (backend ile uyumlu) */
export type TranslatedLabel = { [lang in SupportedLocale]?: string };

export type BillingPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Pazar=0

export type DueRule =
  | { type: "dayOfMonth"; day: number }
  | { type: "nthWeekday"; nth: 1 | 2 | 3 | 4 | 5; weekday: Weekday };

/** Backend listelerde populate yapabildiği için union tipleri ekledik */
type PopulatedApartment = { _id: string; title?: TranslatedLabel; slug?: string };
type PopulatedCustomer  = { _id: string; companyName?: string; contactName?: string };
type PopulatedService   = { _id: string; code?: string; name?: TranslatedLabel | string };

export interface IBillingPlanSource {
  contract: string;           // ObjectId
  contractLine?: string;      // ObjectId
  mode: "fixed" | "perLine";
  snapshots?: {
    contractCode?: string;
    apartment?: string | PopulatedApartment;
    customer?: string | PopulatedCustomer;
    service?: string | PopulatedService;
    title?: TranslatedLabel;
  };
}

export interface IBillingPlanSchedule {
  amount: number;
  currency: string;
  period: BillingPeriod;
  dueRule: DueRule;
  startDate: string | Date;
  endDate?: string | Date;
  graceDays?: number;
}

export type BillingPlanStatus = "draft" | "active" | "paused" | "ended";

export interface IBillingPlan {
  _id: string;
  tenant: string;
  code: string;
  source: IBillingPlanSource;
  schedule: IBillingPlanSchedule;

  status: BillingPlanStatus;
  lastRunAt?: string | Date;
  nextDueAt?: string | Date;

  notes?: TranslatedLabel;
  revisions?: Array<{
    validFrom: string | Date;
    amount?: number;
    currency?: string;
    reason?: string;
  }>;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export type BillingOccurrenceStatus = "pending" | "invoiced" | "skipped" | "canceled";

/** Occurrence içinde plan alanı populate edilebilir */
type OccurrencePlanMini = {
  _id: string;
  code: string;
  status: BillingPlanStatus;
  schedule?: { period: BillingPeriod; dueRule: DueRule };
};

export interface IBillingOccurrence {
  _id: string;
  tenant: string;
  plan: string | OccurrencePlanMini;
  seq: number;

  windowStart: string | Date;
  windowEnd: string | Date;
  dueAt: string | Date;

  amount: number;
  currency: string;

  status: BillingOccurrenceStatus;
  invoice?: string;         // ObjectId
  notes?: TranslatedLabel;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/* ---- Liste filtre tipleri ---- */
export interface PlanListFilters {
  status?: BillingPlanStatus;
  contract?: string;
  apartment?: string;
  customer?: string;
  q?: string;
  from?: string;
  to?: string;
  nextDueFrom?: string;
  nextDueTo?: string;
  limit?: number;
}

export interface OccurrenceListFilters {
  status?: BillingOccurrenceStatus;
  plan?: string;
  invoice?: string;
  dueFrom?: string;
  dueTo?: string;
  seqFrom?: number;
  seqTo?: number;
  limit?: number;
}
