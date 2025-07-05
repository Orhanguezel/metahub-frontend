// src/modules/coupon/types/index.ts
import type { SupportedLocale } from "@/types/common";

// Çok dilli alanlar için merkezi tanım
export type TranslatedField = {
  [lang in SupportedLocale]?: string;
};


export interface ICouponImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}


export interface Coupon {
  _id?: string;
  code: string;
  tenant: string;
  title: TranslatedField;
  description: TranslatedField;
  images?: ICouponImage[];
  discount: number;
  expiresAt: Date;
   isPublished: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  isActive: boolean;
  updatedAt?: Date;
}


