// src/modules/offers/types.ts
import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [lang in SupportedLocale]?: string };

export type OfferStatus =
  | "draft"
  | "preparing"
  | "sent"
  | "pending"
  | "approved"
  | "rejected";

/** Generic ref from API: plain id or populated */
export type Ref<TLite> = string | ({ _id: string } & Partial<TLite>);

/** Lite shapes used in populated offer payloads */
export interface ICompanyLite {
  _id: string;
  companyName?: string | TranslatedLabel;
  email?: string;
  phone?: string;
  website?: string;
  images?: Array<{ url: string; thumbnail?: string; webp?: string }>;
  address?: any;
  bankDetails?: { bankName?: string; iban?: string; swiftCode?: string };
  taxNumber?: string;
  handelsregisterNumber?: string;
  registerCourt?: string;
}

export interface ICustomerLite {
  _id: string;
  companyName?: string | TranslatedLabel;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: any;
}

export interface IEnsotekProdLite {
  _id: string;
  name?: TranslatedLabel;
  price?: number;
}

export interface ISparepartLite {
  _id: string;
  name?: TranslatedLabel;
  price?: number;
}

export type OfferItemProductType = "ensotekprod" | "sparepart";

export interface IOfferItem {
  /** Which catalog this line refers to */
  productType: OfferItemProductType;

  /** One of these will be present depending on productType */
  ensotekprod?: Ref<IEnsotekProdLite> | null;
  sparepart?: Ref<ISparepartLite> | null;

  productName: TranslatedLabel;       // server fills from selected product
  quantity: number;
  unitPrice: number;
  customPrice?: number;
  vat: number;                        // %
  total: number;                      // line gross (server-calculated)
}

export interface IOfferRevision {
  pdfUrl: string;
  updatedAt: string; // ISO
  by?: string | null;
  note?: string;
}

export interface IOfferEmailMeta {
  to?: string;
  cc?: string[];
  bcc?: string[];
  subject?: TranslatedLabel;
  body?: TranslatedLabel;
  lastEmailError?: string | null;
}

export interface IOffer {
  _id: string;
  tenant: string;
  offerNumber: string;

  source?: "internal" | "publicForm" | "import";
  rfqId?: string | null;

  user?: Ref<{ name?: string; email?: string }> | null;
  company?: Ref<ICompanyLite> | null;
  customer?: Ref<ICustomerLite> | null;
  contactPerson?: string;

  items: IOfferItem[];
  shippingCost: number;
  additionalFees: number;
  discount: number;

  currency: string;
  paymentTerms: TranslatedLabel;
  notes?: TranslatedLabel;

  validUntil: string; // ISO

  status: OfferStatus;
  statusHistory?: Array<{
    status: OfferStatus;
    at: string; // ISO
    by?: string | null;
    note?: string;
  }>;

  totalNet: number;
  totalVat: number;
  totalGross: number;

  pdfUrl?: string;
  revisionHistory?: IOfferRevision[];

  email?: IOfferEmailMeta;
  sentByEmail?: boolean;
  sentAt?: string;        // ISO
  acceptedAt?: string;
  declinedAt?: string;

  acceptTokenHash?: string | null;

  attachments?: Array<{ url: string; name?: string; mime?: string; size?: number }>;

  createdBy?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/* ================== DTOs (requests) ================== */

/** Admin create/update item payload */
export interface IOfferItemInput {
  productType: OfferItemProductType;
  ensotekprod?: string;    // required if productType === "ensotekprod"
  sparepart?: string;      // required if productType === "sparepart"
  quantity: number;
  unitPrice?: number;
  customPrice?: number;
  vat?: number;
  productName?: TranslatedLabel; // optional, server can override
}

export interface CreateOfferDto {
  company: string;
  customer: string;
  items: IOfferItemInput[];
  shippingCost?: number;
  additionalFees?: number;
  discount?: number;
  currency?: string;
  validUntil: string;            // ISO
  notes?: TranslatedLabel;
  paymentTerms?: TranslatedLabel;
  contactPerson?: string;
  email?: IOfferEmailMeta;
  attachments?: Array<{ url: string; name?: string; mime?: string; size?: number }>;
  offerNumber?: string;
  source?: "internal" | "publicForm" | "import";
  rfqId?: string | null;
}

export type UpdateOfferDto = Partial<CreateOfferDto> & {
  status?: OfferStatus;
};

/** Admin: status patch */
export interface PatchOfferStatusDto {
  id: string;
  status: OfferStatus;
  note?: string;
}

/** Public: request-offer payload */
export interface PublicRequestOfferDto {
  name: string;
  email: string;
  company: string;
  phone: string;
  message?: string;
  productId: string;
  productType: OfferItemProductType; // "ensotekprod" | "sparepart"
}

/** Public: request-offer response */
export interface PublicRequestOfferResponse {
  success: boolean;
  message?: string;
  offerId: string;
  customerId: string;
}


export type OfferAdminFilters = {
  q?: string;
  status?: OfferStatus;
  company?: string;
  customer?: string;
};

