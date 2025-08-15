import type { SupportedLocale } from "@/types/common";

/** i18n text (opsiyonel, ileride kullanmak isterseniz) */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

export type ContactKind = "person" | "organization";

export interface IEmail {
  label?: string;      // work, billing...
  value: string;
  primary?: boolean;
}

export interface IPhone {
  label?: string;      // mobile, office...
  value: string;
  primary?: boolean;
}

export interface IAddress {
  label?: string;      // billing, office...
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;    // ISO-2
}

export interface IBillingInfo {
  iban?: string;
  bankName?: string;
  taxNumber?: string;  // VKN / Steuernummer
  currency?: string;   // "EUR" | "TRY" | ...
  defaultDueDayOfMonth?: number; // 1..28
}

export interface IContact {
  _id: string;

  tenant: string;
  kind: ContactKind;

  // Person
  firstName?: string;
  lastName?: string;

  // Organization
  legalName?: string;
  tradeName?: string;

  slug: string;              // unique per tenant
  emails: IEmail[];
  phones: IPhone[];
  addresses: IAddress[];
  billing?: IBillingInfo;

  notes?: string;
  isActive: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* Admin liste filtreleri (backend doğrulamasına birebir uyumlu) */
export interface ContactListFilters {
  q?: string;
  kind?: ContactKind;
  isActive?: boolean;
}
