import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için
export type TranslatedField = { [lang in SupportedLocale]?: string };

// Çok dilli array alanı için
export type TranslatedArrayField = { [lang in SupportedLocale]?: string[] };

export interface IPricing {
  _id?: string;
  title: TranslatedField;
  tenant: string;
  description?: TranslatedField;
  features?: TranslatedArrayField;
  category?: string;
  isPublished: boolean;
  publishedAt?: Date;
  price: number;
  currency: "USD" | "EUR" | "TRY";
  period: "monthly" | "yearly" | "once";
  isPopular?: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
