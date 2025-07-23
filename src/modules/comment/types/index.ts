import type { SupportedLocale } from "@/types/common";

export type TranslatedField = { [lang in SupportedLocale]: string };

// Backend ile birebir uyumlu contentType (Union Type):
export type CommentContentType =
  | "news"
  | "blog"
  | "product"
  | "articles"
  | "services"
  | "bikes"
  | "about"
  | "references"
  | "library"
  | "company"
  | "ensotekprod"
  | "sparepart";

// Ana model
export interface IComment {
  _id?: string;
  userId?: string | { _id: string; name: string; email: string }; // populate edilirse obje gelir
  name?: string;
  email?: string;
  tenant: string;
  contentType: CommentContentType;
  contentId: string | { _id: string; title?: string; slug?: string }; // populate edilirse obje gelir
  label?: string;              // Sadece tek dil (backend ile uyumlu!)
  text: string;                // Sadece tek dil
  reply?: {
    text: TranslatedField;     // Çoklu dil (admin cevabı)
    createdAt?: string;
  };
  isPublished: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
