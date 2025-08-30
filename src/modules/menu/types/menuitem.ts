// src/modules/menu/types/menuitem.ts
import type { TranslatedLabel } from "@/types/common";
import type { AdditiveCode, AllergenCode } from "@/modules/menu/constants/foodLabels";



/** ---------------- Fiyat tipleri ---------------- */
export type CurrencyCode = "EUR" | "TRY" | "USD";
export type PriceKind = "base" | "deposit" | "surcharge" | "discount";
export type PriceChannel = "delivery" | "pickup" | "dinein";

export interface Money {
  amount: number;           // 12.5 gibi normal sayı
  currency: CurrencyCode;   // "EUR" | "TRY" | "USD"
  taxIncluded?: boolean;    // KDV dahil mi?
}

export interface ItemPrice {
  kind: PriceKind;          // base, deposit, surcharge, discount
  value: Money;
  listRef?: string;         // ObjectId -> string (opsiyonel)
  activeFrom?: string;      // ISO
  activeTo?: string;        // ISO
  minQty?: number;
  channels?: PriceChannel[];
  outlet?: string;
  note?: string;
}

/** ---------------- KV tipleri ---------------- */
export interface IKeyValueI18n<K extends string = string> {
  key: K;
  value: TranslatedLabel;
}

/** ---------------- Medya ---------------- */
export interface IMenuItemImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

/** ---------------- Variant & Modifiers ---------------- */
export interface IMenuItemVariant {
  code: string;
  name: TranslatedLabel;
  order?: number;
  isDefault?: boolean;
  sku?: string;
  barcode?: string;

  sizeLabel?: TranslatedLabel;
  volumeMl?: number;
  netWeightGr?: number;

  /** Yeni: gömülü fiyatlar */
  prices?: ItemPrice[];

  /** Geriye dönük (opsiyonel referanslar) */
  priceListItem?: string;
  depositPriceListItem?: string;
}

export interface IMenuItemModifierOption {
  code: string;
  name: TranslatedLabel;
  order?: number;
  isDefault?: boolean;

  /** Yeni: gömülü fiyatlar */
  prices?: ItemPrice[];

  /** Geriye dönük (opsiyonel referans) */
  priceListItem?: string;
}

export interface IMenuItemModifierGroup {
  code: string;
  name: TranslatedLabel;
  order?: number;
  minSelect?: number;
  maxSelect?: number;
  options: IMenuItemModifierOption[];
  isRequired?: boolean;
}

/** ---------------- Diğer alanlar ---------------- */
export interface IMenuItemDietary {
  vegetarian?: boolean;
  vegan?: boolean;
  pescatarian?: boolean;
  halal?: boolean;
  kosher?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  nutFree?: boolean;
  eggFree?: boolean;
  porkFree?: boolean;
  spicyLevel?: number;                // 0..3
  containsAlcohol?: boolean;
  caffeineMgPerServing?: number;
  abv?: number;
  caloriesKcal?: number;
  macros?: { proteinGr?: number; carbsGr?: number; fatGr?: number };
}

export interface IMenuItemOps {
  availability?: { delivery?: boolean; pickup?: boolean; dinein?: boolean };
  minPrepMinutes?: number;
  kitchenSection?: string;
  availableFrom?: string | null;      // ISO
  availableTo?: string | null;        // ISO
}

export interface IMenuItemCategoryRef {
  category: string;                   // menucategory _id
  order?: number;
  isFeatured?: boolean;
}

export interface IMenuItem {
  _id: string;

  tenant: string;
  code: string;
  slug: string;

  name: TranslatedLabel;
  description?: TranslatedLabel;

  images: IMenuItemImage[];

  categories: IMenuItemCategoryRef[];
  variants: IMenuItemVariant[];
  modifierGroups?: IMenuItemModifierGroup[];

  /** Sabit sözlük kodlarıyla kısıtlı KV */
  allergens?: IKeyValueI18n<AllergenCode>[];
  additives?: IKeyValueI18n<AdditiveCode>[];

  dietary?: IMenuItemDietary;
  ops?: IMenuItemOps;

  sku?: string;
  barcode?: string;
  taxCode?: string;

  isPublished: boolean;
  isActive: boolean;

  createdAt: string;                  // ISO
  updatedAt: string;                  // ISO
}

/** ============ Create / Update payloads ============ */
export type MenuItemCreatePayload = {
  code: string;
  slug?: string;
  name: TranslatedLabel;
  description?: TranslatedLabel;

  categories?: IMenuItemCategoryRef[];
  variants?: IMenuItemVariant[];         // prices dahil
  modifierGroups?: IMenuItemModifierGroup[]; // option.prices dahil

  allergens?: IKeyValueI18n<AllergenCode>[];
  additives?: IKeyValueI18n<AdditiveCode>[];

  dietary?: IMenuItemDietary;
  ops?: IMenuItemOps;

  sku?: string;
  barcode?: string;
  taxCode?: string;

  images?: File[];                    // upload
};

export type RemovedImage =
  | string                        // url
  | { url?: string; publicId?: string };

export type MenuItemUpdatePayload = Partial<
  Omit<MenuItemCreatePayload, "code">
> & {
  isPublished?: boolean;
  isActive?: boolean;
  /** Server destekli: mevcut görüntü sırası (publicId|url sıralaması) */
  existingImagesOrder?: string[];
  /** Server destekli: silinecek görseller */
  removedImages?: RemovedImage[];
  images?: File[];
};
