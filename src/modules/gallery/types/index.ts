// types/index.ts
import type { TranslatedLabel } from "@/types/common";

export interface IGalleryCategory {
  _id: string;
  slug: string;
  name: Partial<TranslatedLabel>;
  description?: Partial<TranslatedLabel>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGalleryItem {
  url: string;
  thumbnail?: string;
  webp?: string;
  name: Partial<TranslatedLabel>;
  description?: Partial<TranslatedLabel>;
  order?: number;
}

export interface IGallery {
  _id: string;
  category: string | IGalleryCategory;
  type: "image" | "video";
  images: IGalleryItem[];
  isPublished?: boolean;
  tenant: string;
  isActive?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGalleryStats {
  total: number;
  published: number;
  archived: number;
  active: number;
  inactive: number;
  images: number;
  videos: number;
}
