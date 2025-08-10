// src/modules/apartment/types.ts
import type { SupportedLocale } from "@/types/common";


// i18n
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// --- Images ---
export interface IApartmentImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

// --- Address & Geo ---
export interface IAddress {
  street?: string;
  number?: string;
  district?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;      // ISO-2 (DE/TR/…)
  fullText?: string;    // "Hansaring 12, 53111 Bonn, DE"
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

// --- Contact (Responsible) ---
export interface IContactPerson {
  customerRef?: string; // ref: "customer"
  userRef?: string;     // ref: "user"
  name: string;
  phone?: string;
  email?: string;
  role?: string;        // "Hausmeister", "Yönetici" vb.
}

// --- Service assignment & fees ---
export type PeriodUnit = "day" | "week" | "month";
export type FeePeriod  = "once" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface IServiceAssignment {
  // services.service alanı populate edilmiş olabilir
  service:
    | string
    | {
        _id: string;
        title?: TranslatedField;
        price?: number;
        durationMinutes?: number;
        slug?: string;
      };
  name?: TranslatedField;             // snapshot
  priceSnapshot?: number;
  durationMinutesSnapshot?: number;
  period: {
    every: number;
    unit: PeriodUnit;
    daysOfWeek?: number[];            // 0..6
  };
  lastPerformedAt?: string;
  nextPlannedAt?: string;
  isActive: boolean;
  notes?: TranslatedField;
}

export interface IFee {
  type: "dues" | "cleaning" | "security" | "trash" | "custom";
  label?: TranslatedField;
  amount: number;
  currency: string;                   // "EUR", "TRY", ...
  period: FeePeriod;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

// --- Apartment ---
export interface IApartment {
  _id: string;

  // Content
  title?: TranslatedField;
  content?: TranslatedField;
  images: IApartmentImage[];

  // Multi-tenant & URL
  tenant: string;
  slug: string;

  // Location
  address: IAddress;
  location?: IGeoPoint;

  // Category (populate edilebilir)
  category:
    | string
    | {
        _id: string;
        name: TranslatedField;
        slug?: string;
      };

  // İlgili müşteri (populate edilebilir)
  customer?:
    | string
    | {
        _id: string;
        companyName: string;
        contactName: string;
        email?: string;
        phone?: string;
      };

  // Sorumlu kişi
  contact: IContactPerson;

  // Services & fees
  services: IServiceAssignment[];
  fees?: IFee[];

  // Publish & status
  isPublished: boolean;
  publishedAt?: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// --- Category (apartmentcategory) ---
export interface ApartmentCategory {
  _id: string;
  name: TranslatedField;
  slug: string;            // unique per tenant (compound)
  tenant: string;
  city?: string;
  district?: string;
  zip?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
