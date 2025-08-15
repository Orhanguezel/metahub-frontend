/* ------------ common types ------------ */
export type CurrencyCode = "USD" | "EUR" | "TRY";
export type CashAccountType = "cash" | "bank" | "other";
export type EntryDirection = "in" | "out";

/* ------------ accounts ------------ */
export interface ICashAccount {
  _id: string;
  tenant: string;
  code: string;                 // UPPER_SNAKE
  name: string;
  type: CashAccountType;
  currency: CurrencyCode;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AccountListFilters {
  isActive?: boolean;
}

/* ------------ entries ------------ */
export interface ICashEntrySource {
  module: "manual" | "invoice" | "payment" | "expense" | "adjustment" | "job";
  refId?: string;
}

export interface ICashEntry {
  _id: string;

  tenant: string;
  accountId: string;
  date: string | Date;
  direction: EntryDirection;
  amount: number;
  currency: CurrencyCode;
  description?: string;
  category?: string;
  tags?: string[];

  apartmentId?: string;
  contractId?: string;
  invoiceId?: string;
  paymentId?: string;
  expenseId?: string;
  jobId?: string;

  source: ICashEntrySource;
  locked: boolean;

  isReconciled: boolean;
  reconciliationId?: string;
  reconciledAt?: string | Date;

  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EntryListFilters {
  accountId?: string;
  apartmentId?: string;
  direction?: EntryDirection;
  category?: string;
  reconciled?: boolean;
  from?: string; // ISO
  to?: string;   // ISO
}

/** Backend genel response şekli */
export type ApiResp<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};
