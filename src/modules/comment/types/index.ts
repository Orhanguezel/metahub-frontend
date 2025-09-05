// src/modules/comment/types.ts
import type { SupportedLocale } from "@/types/common";

export type TranslatedField = { [lang in SupportedLocale]: string };

export type CommentContentType =
  | "news"
  | "blog"
  | "product"
  | "articles"
  | "services"
  | "massage"
  | "bikes"
  | "about"
  | "references"
  | "library"
  | "company"
  | "ensotekprod"
  | "sparepart"
  | "portfolio"
  | "skill"
  | "menuitem"
  | "team"
  | "global"; // ✅ eklendi

export type CommentType =
  | "comment"
  | "testimonial"
  | "review"
  | "question"
  | "answer"
  | "rating";

export interface IComment {
  _id?: string;
  userId?: string | { _id: string; name: string; email: string };
  name?: string;
  company?: string;
  position?: string;
  profileImage?: string | { thumbnail?: string; url?: string };
  email?: string;

  tenant: string;
  contentType: CommentContentType;

  /** ✅ testimonial’de olmayabileceği için opsiyonel + null destek */
  contentId?: string | { _id: string; title?: string; slug?: string } | null;

  type?: CommentType;
  label?: string;
  text: string;

  reply?: {
    text: TranslatedField;
    createdAt?: string;
  };

  isPublished: boolean;
  isActive: boolean;

  /** ✅ optional ve null güvenli */
  rating?: number | null;

  createdAt?: string;
  updatedAt?: string;
}
