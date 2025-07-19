import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface IReferencesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Ana referans tipi (firma logosu)
export interface IReferences {
  _id: string;
  title?: TranslatedField;
  slug: string;
  content?: TranslatedField;
  tenant: string;
  images: IReferencesImage[];
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
export interface ReferencesCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
