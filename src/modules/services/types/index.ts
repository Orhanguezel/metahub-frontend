// src/types/services.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface IServicesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana makale (services) tipi
export interface IServices {
  _id: string;
  title: TranslatedField;
  slug: string;
  summary: TranslatedField;
  content: TranslatedField;
  tenant: string;
  tags: string[];
  images: IServicesImage[];
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
export interface ServicesCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
