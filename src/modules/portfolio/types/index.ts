// src/types/portfolio.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface IPortfolioImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana makale (portfolio) tipi
export interface IPortfolio {
  _id: string;
  title: TranslatedField;
  slug: string;
  summary: TranslatedField;
  content: TranslatedField;
  tenant: string;
  tags: string[];
  images: IPortfolioImage[];
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
export interface PortfolioCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
