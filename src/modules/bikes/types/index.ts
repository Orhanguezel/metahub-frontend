import type { TranslatedLabel } from "@/types/common";

export interface IBikeImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  altText: Partial<TranslatedLabel>; // Çok dilli, zorunlu değil
}

export interface IBike {
  _id: string;
  name: Partial<TranslatedLabel>;
  slug: string;
  description?: Partial<TranslatedLabel>;
  brand: string;
  price: number;
  stock: number;
  stockThreshold?: number;
  category: {
    _id: string;
    name: Partial<TranslatedLabel>;
  } | string; 
  tags?: string[];
  images: IBikeImage[];

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


export interface BikeCategory {
  _id: string;
  name: Partial<TranslatedLabel>;
  slug: string;
  description?: Partial<TranslatedLabel>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
