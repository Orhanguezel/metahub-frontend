// src/types/blog.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

export interface IComment {
  _id: string;
  name: string;
  email: string;
  label: TranslatedField; // Çoklu dil desteği (örn. { tr, en, de })
  contentType:
    | "news"
    | "blog"
    | "product"
    | "articles"
    | "services"
    | "bikes"
    | "about"
    | "product"
    | "references"
    | "library"
    | "company";
  contentId: string | { _id: string; title?: TranslatedField; slug?: string };
  userId?: string | { _id: string; name: string; email: string };
  isPublished: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  reply?: {
    text: TranslatedField;
    createdAt?: string;
  };
  rating?: number;
}
