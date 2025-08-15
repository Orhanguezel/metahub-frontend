import type { SupportedLocale } from "@/types/common";

/** i18n text */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

export type PeriodUnit = "day" | "week" | "month";
export type BillingPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday=0

/* Helpers for populated refs */
type Id = string;
type IdOr<T> = Id | (T & { _id: Id });

/** Due rule (matches backend validator) */
export type DueRule =
  | { type: "dayOfMonth"; day: number }
  | { type: "nthWeekday"; nth: 1 | 2 | 3 | 4 | 5; weekday: Weekday };

/** Parties */
export interface IApartmentMini {
  title?: TranslatedLabel;
  slug?: string;
}
export interface ICustomerMini {
  companyName?: string;
  contactName?: string;
}

export interface IContractParties {
  apartment: IdOr<IApartmentMini>;
  customer?: IdOr<ICustomerMini>;
  contactSnapshot?: {
    name: string;
    phone?: string;
    email?: string;
    role?: string;
  };
}

/** Line (service populated fields used by admin/detail) */
export interface IServiceMini {
  name?: TranslatedLabel;
  code?: string;
  defaultDurationMin?: number;
  defaultTeamSize?: number;
}

export interface IContractLine {
  service: IdOr<IServiceMini>;
  name?: TranslatedLabel;
  description?: TranslatedLabel;

  isIncludedInContractPrice?: boolean;
  unitPrice?: number;
  currency?: string;

  schedule?: {
    every: number;
    unit: PeriodUnit;
    daysOfWeek?: Weekday[];
    exceptions?: Weekday[];
  };

  manpower?: {
    headcount: number;
    durationMinutes: number;
  };

  isActive: boolean;
  notes?: TranslatedLabel;
}

/** Billing */
export interface IContractBillingRevision {
  validFrom: string | Date;
  amount?: number;
  currency?: string;
  reason?: string;
}

export interface IContractBilling {
  mode: "fixed" | "perLine";
  amount?: number;                 // required when mode=fixed (backend enforces)
  currency: string;
  period: BillingPeriod;
  dueRule: DueRule;
  startDate: string | Date;
  endDate?: string | Date;
  graceDays?: number;
  revisions?: IContractBillingRevision[];
}

/** Status */
export type ContractStatus =
  | "draft"
  | "active"
  | "suspended"
  | "terminated"
  | "expired";

/** Contract root */
export interface IContract {
  _id: string;

  tenant: string;
  code: string;
  title?: TranslatedLabel;
  description?: TranslatedLabel;

  parties: IContractParties;
  lines: IContractLine[];
  billing: IContractBilling;

  status: ContractStatus;
  activatedAt?: string | Date;
  terminatedAt?: string | Date;
  reasonNote?: string;

  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/* List filters (admin) – mirrors backend validateContractListQuery */
export interface ContractListFilters {
  status?: ContractStatus;
  apartment?: string;
  customer?: string;
  period?: BillingPeriod;
  startFrom?: string; // ISO
  startTo?: string;   // ISO
  q?: string;
  isActive?: boolean;
  limit?: number;
}
