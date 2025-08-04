import type { TranslatedLabel } from "@/types/common";
type ObjectIdLike = string | { _id: string; [key: string]: any } | null;


// --- Product kalemi
export interface OfferItem {
  product?: ObjectIdLike;         // string (id) veya { _id, ... }
  ensotekprod?: ObjectIdLike;
  productName: TranslatedLabel;
  quantity: number;
  unitPrice: number;
  customPrice?: number;
  vat: number;
  total: number;
}

// --- Revizyon geçmişi
export interface OfferRevision {
  pdfUrl: string;
  updatedAt: string;            // ISO string (Date.toISOString())
  by: ObjectIdLike;
  note?: string;
}

// --- Ana teklif tipi
export interface Offer {
  _id?: string;
  tenant: string;
  offerNumber: string;
  user?: ObjectIdLike;
  company?: ObjectIdLike;
  customer?: ObjectIdLike;
  contactPerson?: string;
  items: OfferItem[];
  shippingCost?: number;
  additionalFees?: number;
  discount?: number;
  currency: string;
  paymentTerms: TranslatedLabel;
  notes?: TranslatedLabel;
  validUntil: string;           // ISO tarih stringi
  status: "draft" | "preparing" | "sent" | "pending" | "approved" | "rejected";
  totalNet: number;
  totalVat: number;
  totalGross: number;
  pdfUrl?: string;
  sentByEmail?: boolean;
  sentAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  revisionHistory?: OfferRevision[];
  createdBy?: ObjectIdLike;
  createdAt: string;
  updatedAt: string;
}

export interface RequestOfferPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  productId?: string;
  productType?: "product" | "ensotekprod" | "specialprod";
}

