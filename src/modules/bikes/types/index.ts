import type { TranslatedLabel } from "@/types/common";

export interface IBikesImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

export interface IBikes {
  _id: string;
  name: Partial<TranslatedLabel>;
  slug: string;
  tenant: string;
  description?: Partial<TranslatedLabel>;
  brand: string;
  price: number;
  stock: number;
  stockThreshold?: number;
  category:
    | {
        _id: string;
        name: Partial<TranslatedLabel>;
      }
    | string;
  tags?: string[];
  images: IBikesImage[];

  frameMaterial?: string;
  brakeType?: string;
  wheelSize?: number;
  gearCount?: number;
  suspensionType?: string;
  color?: string[];
  weightKg?: number;
  isElectric?: boolean;
  batteryRangeKm?: number;
  motorPowerW?: number;

  comments?: string[];
  likes?: number;

  isActive: boolean;
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CategoryImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  altText?: Partial<TranslatedLabel>;
}

export interface BikesCategory {
  _id: string;
  name: Partial<TranslatedLabel>;
  description?: Partial<TranslatedLabel>;
  slug: string;
  images?: CategoryImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
