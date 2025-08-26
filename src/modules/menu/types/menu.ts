import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

/** Images (API shape) */
export interface IMenuImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

/** Menü içindeki kategori bağları (FE) */
export interface IMenuCategoryRef {
  category: string;     // menucategory _id
  order?: number;       // 0..100000
  isFeatured?: boolean;
}

/** Menu (API shape - FE) */
export interface IMenu {
  _id: string;

  tenant: string;
  code: string;               // tenant + code unique
  slug: string;               // public detail: GET /menu/:slug

  name: TranslatedLabel;
  description?: TranslatedLabel;

  images: IMenuImage[];

  branches?: string[];        // branch ids
  categories: IMenuCategoryRef[];

  effectiveFrom?: string | null;  // ISO
  effectiveTo?: string | null;    // ISO

  isPublished: boolean;
  isActive: boolean;

  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

/** Create/Update payload helpers (JSON side) */
export type MenuCreatePayload = {
  code: string;
  name: TranslatedLabel;
  description?: TranslatedLabel;
  branches?: string[];
  categories?: IMenuCategoryRef[];
  effectiveFrom?: string | null;   // ISO
  effectiveTo?: string | null;     // ISO
  /** Optional: image files to upload; if present we’ll convert to FormData */
  images?: File[];
};

export type MenuUpdatePayload = Partial<
  Omit<MenuCreatePayload, "code">
> & {
  isPublished?: boolean;
  isActive?: boolean;
  /** Optional: image files to upload; if present we’ll convert to FormData */
  images?: File[];
};
