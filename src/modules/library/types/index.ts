import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};

// Görsel nesne tipi
export interface ILibraryImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Genel dosya tipi (PDF, DOCX, XLSX vs.)
export interface ILibraryFile {
  url: string;
  name: string;
  size?: number;
  type?: string; // PDF için: "application/pdf" (gelecekte DOCX/XLSX vs. de olabilir)
  publicId?: string;
  _id?: string;
}

// Ana makale (library) tipi
export interface ILibrary {
  _id: string;
  title: TranslatedField;
  slug: string;
  summary?: TranslatedField;
  content: TranslatedField;
  tenant: string;
  tags?: string[];
  images?: ILibraryImage[];
  files?: ILibraryFile[];
  category:
    | string
    | {
        _id: string;
        name: TranslatedField;
      };
  author?: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  comments?: string[];
  views: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Kategori modeli
export interface LibraryCategory {
  _id: string;
  name: TranslatedField;
  slug: string;
  description?: TranslatedField;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
