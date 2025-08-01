import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface ISkillImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana referans tipi (firma logosu)
export interface ISkill {
  _id: string;
  title?: TranslatedField;
  slug: string;
  summary?: TranslatedField;
  content?: TranslatedField;
  tenant: string;
  images: ISkillImage[];
  category:
  | string
  | {
    _id: string;
    name: TranslatedField;
  };
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}


// Kategori modeli
export interface SkillCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
