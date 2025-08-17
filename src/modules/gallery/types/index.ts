// src/types/gallery.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel tipi
export interface IGalleryImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string; // backend _id:true -> JSON'da gelir
}

// Ana model
export interface IGallery {
  _id: string;
  type: "image" | "video";
  title: TranslatedField;
  slug: string;
  summary: TranslatedField;
  content: TranslatedField;
  tenant: string;
  tags: string[];
  images: IGalleryImage[];
  category:
    | string
    | {
        _id: string;
        name: TranslatedField;
        slug?: string; // admin listte populate sırasında seçilebilir
      };
  author: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  comments: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Kategori modeli
export interface GalleryCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
