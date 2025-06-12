// src/types/article.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface IArticlesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana makale (article) tipi
export interface IArticles {
  _id: string;
  title: TranslatedField;
  slug: string;
  summary: TranslatedField;
  content: TranslatedField;
  label: TranslatedField;
  tags: string[];
  images: IArticlesImage[];
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
  comments: string[]; // populate edilirse genişletilebilir
  createdAt: string;
  updatedAt: string;
}

// Kategori modeli
export interface ArticlesCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
