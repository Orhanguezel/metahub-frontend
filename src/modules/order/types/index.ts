import type { SupportedLocale } from "@/types/common";
import type { User } from "@/modules/users/types/user";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";

/** Menü ürünü tipleri (FE’de minimal tanım) */
export interface IMenuModifierSelection {
  groupCode: string;
  optionCode: string;
  quantity?: number;
}
export type TranslatedLabel = { [key in SupportedLocale]?: string };

export interface IOrderMenuSelection {
  variantCode?: string;
  modifiers?: IMenuModifierSelection[];
  notes?: string;
  depositIncluded?: boolean;
  snapshot?: {
    name?: TranslatedLabel;
    variantName?: TranslatedLabel;
    sizeLabel?: TranslatedLabel;
    image?: string;
    allergens?: Array<{ key: string; value: TranslatedLabel }>;
    additives?: Array<{ key: string; value: TranslatedLabel }>;
    dietary?: {
      vegetarian?: boolean;
      vegan?: boolean;
      containsAlcohol?: boolean;
      spicyLevel?: number;
    };
  };
}

export interface IPriceComponents {
  base: number;
  deposit?: number;
  modifiersTotal: number;
  modifiers?: Array<{ code: string; qty: number; unitPrice: number; total: number }>;
  currency: string;
}

export type PaymentMethod = "cash_on_delivery" | "credit_card" | "paypal";
/** BE ile uyumlu: delivered yok, flag olarak isDelivered var */
export type OrderStatus = "pending" | "preparing" | "shipped" | "completed" | "cancelled";

/** --- Sipariş ürünü (order item) --- */
export interface IOrderItem {
  product: IBikes | IEnsotekprod | ISparepart | Record<string, any> | string;
  productType: "bike" | "ensotekprod" | "sparepart" | "menuitem";
  quantity: number;
  tenant: string;

  /** BE hesaplar (menuitem için) ama tip olarak zorunlu dönüyor */
  unitPrice: number;
  unitCurrency?: string;

  priceAtAddition?: number;          // satır eklenirken birim fiyat
  totalPriceAtAddition?: number;   // satır eklenirken toplam fiyat (unitPrice * quantity)

  /** Sadece menuitem için dolar */
  menu?: IOrderMenuSelection;

  /** Menü kalemi için BE’den gelir */
  priceComponents?: IPriceComponents;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  tenant: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  addressLine?: string;
  houseNumber?: string;
  email?: string;
  addressType?: string;
}

/** --- Sipariş modeli --- */
export interface IOrder {
  _id?: string;
  user: string | User;
  tenant: string;

  // Restaurant
  serviceType?: "delivery" | "pickup" | "dinein";
  branch?: string;
  tableNo?: string;

  // Adres
  addressId?: string;
  shippingAddress?: IShippingAddress;

  // Satırlar
  items: IOrderItem[];

  // Tutarlar (BE ile hizalı)
  currency?: string; // default TRY
  subtotal: number;
  deliveryFee?: number;
  tipAmount?: number;
  serviceFee?: number;
  taxTotal?: number;
  finalTotal: number;

  discount?: number;
  coupon?: string;

  paymentMethod: PaymentMethod;
  payments?: string[];
  status: OrderStatus;
  isDelivered: boolean;
  isPaid: boolean;
  deliveredAt?: string | Date;
  language?: SupportedLocale;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
