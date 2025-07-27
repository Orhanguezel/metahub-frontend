// src/modules/faq/types/index.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

export interface IFaq {
  _id?: string;
  question: TranslatedField;
  answer: TranslatedField;
  tenant?: string;
  category?: string;
  isPublished: boolean;
  publishedAt?: Date;
  embedding?: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
