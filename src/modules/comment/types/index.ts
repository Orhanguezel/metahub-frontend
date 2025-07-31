import type { SupportedLocale } from "@/types/common";

export type TranslatedField = { [lang in SupportedLocale]: string };

// Hangi modüle/işe bağlı olduğu:
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
  | "sparepart"
  | "portfolio"
  | "skill"
  | "team"



// Yorumun türü (amacı): (isteğe göre genişlet)
export type CommentType = "comment" | "testimonial" | "review" | "question" | "answer" | "rating";

export interface IComment {
  _id?: string;
  userId?: string | { _id: string; name: string; email: string }; // populate edilirse obje gelir
  name?: string;
  company?: string;
  position?: string;
  profileImage?: string | { thumbnail?: string; url?: string };
  email?: string;
  tenant: string;
  contentType: CommentContentType;    // Hangi modül/iş
  contentId: string | { _id: string; title?: string; slug?: string }; // Hangi içerik
  type?: CommentType;                 // Yorum türü (default: "comment")
  label?: string;                     // Sadece tek dil (backend ile uyumlu!)
  text: string;                       // Sadece tek dil
  reply?: {
    text: TranslatedField;            // Çoklu dil (admin cevabı)
    createdAt?: string;
  };
  isPublished: boolean;
  isActive: boolean;
  rating?: number;                    // Review için opsiyonel puan (örn: 1-5)
  createdAt?: string;
  updatedAt?: string;
}
