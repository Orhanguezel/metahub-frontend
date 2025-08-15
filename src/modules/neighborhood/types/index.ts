import type { SupportedLocale } from "@/types/common";

/** i18n ad alanı: backend tüm dilleri boş string ile döndürür */
export type LocalizedName = Record<SupportedLocale, string>;

export interface INeighborhoodCodes {
  cityCode?: string;
  districtCode?: string;
  external?: Record<string, any>;
}

export interface INeighborhoodGeo {
  lat?: number;
  lng?: number;
}

export interface INeighborhood {
  _id: string;
  tenant: string;

  name: LocalizedName;
  slug: string;

  city?: string;
  district?: string;
  zip?: string;

  codes?: INeighborhoodCodes;
  geo?: INeighborhoodGeo;
  aliases?: string[];
  tags?: string[];
  sortOrder?: number;

  isActive: boolean;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/* ---- Liste filtre tipleri ---- */
export interface NeighborhoodListFilters {
  isActive?: boolean;
  city?: string;
  district?: string;
  zip?: string;
  cityCode?: string;
  districtCode?: string;
  tag?: string;
  q?: string;
  limit?: number;
}
