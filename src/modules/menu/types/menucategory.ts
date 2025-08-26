// src/modules/menucategory/types.ts
import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

/** Images (API shape) */
export interface IMenuCategoryImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

/** MenuCategory (API shape - FE) */
export interface IMenuCategory {
  _id: string;
  tenant: string;
  code: string;                 // business key (tenant+code unique)
  slug: string;

  name: TranslatedLabel;        // at least one language
  description?: TranslatedLabel;

  images: IMenuCategoryImage[];
  order?: number;

  isPublished: boolean;
  isActive: boolean;

  createdAt: string;            // ISO
  updatedAt: string;            // ISO
}

/** Create/Update payload helpers (JSON form) */
export type MenuCategoryCreatePayload = {
  code: string;
  name: TranslatedLabel;
  description?: TranslatedLabel;
  order?: number;
  /** Optional when creating without uploader; will be converted to FormData if present */
  images?: File[];
};

export type MenuCategoryUpdatePayload = Partial<
  Omit<MenuCategoryCreatePayload, "code">
> & {
  isPublished?: boolean;
  isActive?: boolean;
};
