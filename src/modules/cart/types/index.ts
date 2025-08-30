import type { SupportedLocale } from "@/types/common";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";
import type { IMenuItem } from "@/modules/menu/types/menuitem";

/** ---- Menü seçimi ---- */
export interface ICartModifierPick {
  groupCode: string;
  optionCode: string;
  quantity?: number;
}

export interface ICartMenuSelection {
  variantCode?: string;
  depositIncluded?: boolean;
  modifiers?: ICartModifierPick[];
  notes?: string;
  snapshot?: {
    name?: Record<string, string>;
    variantName?: Record<string, string>;
  };
}

/** ---- Fiyat bileşenleri & FE fiyat ipucu ---- */
export type CartLinePriceComponents = {
  base?: number;
  modifiersTotal?: number;
  deposit?: number;
  currency?: string;
};

export type CartLinePriceHint = {
  unitPrice: number;
  currency: string;
  priceComponents?: CartLinePriceComponents;
};

/** ---- Sepet item'ı ---- */
export interface ICartItem {
  // Menü ürünleri BE tarafından populate edildiğinde IMenuItem gelebilir → kapsa!
  product: IBikes | IEnsotekprod | ISparepart | IMenuItem | string;
  productType: "bike" | "ensotekprod" | "sparepart" | "menuitem";
  quantity: number;
  tenant: string;

  /** Legacy alanlar */
  unitPrice: number;
  priceAtAddition: number;
  totalPriceAtAddition: number;

  /** Opsiyonel para birimi/bileşenler (BE döndürebilir) */
  unitCurrency?: string;
  priceComponents?: CartLinePriceComponents;

  /** Sadece menuitem */
  menu?: ICartMenuSelection;

  /** Geçiş amaçlı */
  variantCode?: string;
  modifiers?: ICartModifierPick[];
  mods?: Record<string, string[]>;
}

/** ---- Sepet ---- */
export interface ICart {
  _id?: string;
  user?: string;
  tenant?: string;
  items: ICartItem[];
  totalPrice: number;       // BE 0 gönderebilir → UI fallback hesaplar
  currency?: string;        // opsiyonel sepet para birimi
  couponCode?: string | null;
  status: "open" | "ordered" | "cancelled";
  isActive: boolean;
  discount?: number;
  language?: SupportedLocale;
  createdAt?: string;
  updatedAt?: string;
}
