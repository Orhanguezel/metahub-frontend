import type { TranslatedLabel } from "@/types/common";

// Teklifteki ürün kalemi (hem product hem ensotekprod desteği)
export interface OfferItem {
  product?: string;         // ObjectId as string
  ensotekprod?: string;     // ObjectId as string
  productName: TranslatedLabel;
  quantity: number;
  unitPrice: number;
  customPrice?: number;
  vat: number;
  total: number;
}

// PDF revizyon geçmişi
export interface OfferRevision {
  pdfUrl: string;
  updatedAt: string;        // ISO tarih stringi
  by: string;               // user ObjectId as string
  note?: string;
}

// Ana teklif tipi
export interface Offer {
  _id?: string;
  tenant: string;
  offerNumber: string;
  user: string;
  company: string;
  customer: string;
  contactPerson?: string;
  items: OfferItem[];
  shippingCost?: number;
  additionalFees?: number;
  discount?: number;
  currency: string;
  paymentTerms: TranslatedLabel;
  notes?: TranslatedLabel;
  validUntil: string; // ISO tarih stringi
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}


export interface RequestOfferPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  productId?: string; // seçilen ürünün _id'si
  productType?: "product" | "ensotekprod" | "specialprod"; // Ürün tipi
}
