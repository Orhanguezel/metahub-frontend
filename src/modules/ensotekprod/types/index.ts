import type { SupportedLocale } from "@/types/common";

// Çoklu dil etiket
export type TranslatedLabel = { [key in SupportedLocale]: string };

export interface IEnsotekprodImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

export interface IEnsotekprod {
  _id: string;

  // Temel bilgiler
  name: TranslatedLabel; // zorunlu
  tenant: string;        // zorunlu
  slug: string;          // zorunlu
  description: TranslatedLabel; // zorunlu
  brand: string;         // zorunlu
  category: string | {
    _id: string;
    name: TranslatedLabel;
  }; // zorunlu (string veya populate)
  tags?: string[];

  // Stok & fiyat
  price: number;         // zorunlu
  stock: number;         // zorunlu
  stockThreshold?: number;

  // Görseller
  images: IEnsotekprodImage[]; // zorunlu (en az 1 ana görsel!)

  // Teknik opsiyonel özellikler
  material?: string;
  color?: string[];
  weightKg?: number;
  size?: string;
  powerW?: number;
  voltageV?: number;
  flowRateM3H?: number;
  coolingCapacityKw?: number;

  // Elektrik opsiyonları
  isElectric: boolean;         // zorunlu
  batteryRangeKm?: number;
  motorPowerW?: number;

  // Durum/meta
  isActive: boolean;           // zorunlu
  isPublished: boolean;        // zorunlu
  likes: number;               // zorunlu
  comments?: string[];         // string veya ObjectId[]
  createdAt?: string;
  updatedAt?: string;
}


export interface CategoryImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  altText?: Partial<TranslatedLabel>;
}

export interface EnsotekCategory {
  _id: string;
  name: Partial<TranslatedLabel>;
  description?: Partial<TranslatedLabel>;
  slug: string;
  images?: CategoryImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
