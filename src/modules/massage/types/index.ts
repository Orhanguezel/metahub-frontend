// src/types/massage.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface IMassageImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana makale (massage) tipi
export interface IMassage {
  _id: string;
  title: TranslatedField;
  slug: string;
  summary: TranslatedField;
  content: TranslatedField;
  tenant: string;
  tags: string[];
  images: IMassageImage[];
  durationMinutes?: number;
  price?: number;
  category:
  | string
  | {
    _id: string;
    name: TranslatedField;
  };
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

// Kategori modeli
export interface MassageCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
