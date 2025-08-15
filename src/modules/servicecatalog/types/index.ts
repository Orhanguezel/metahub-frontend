// types.ts
import type { SupportedLocale } from "@/types/common";

export type ObjectId = string;

// ❗ was: Record<string, string | undefined>
export type TranslatedLabel = Partial<Record<SupportedLocale, string>>;

export interface IServiceCatalogImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

export interface IServiceCatalog {
  _id: ObjectId;
  tenant: string;
  code: string;

  name: TranslatedLabel;
  description?: TranslatedLabel;

  defaultDurationMin: number;
  defaultTeamSize: number;
  suggestedPrice?: number;

  // ❗ name i18n; populate gelirse obje, gelmezse id
  category?: ObjectId | { _id: ObjectId; name?: TranslatedLabel; slug?: string };
  tags: string[];

  images: IServiceCatalogImage[];
  isActive: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CatalogAdminFilters {
  q?: string;
  code?: string;
  category?: ObjectId;
  isActive?: boolean;
}
