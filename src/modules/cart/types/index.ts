// src/modules/cart/types/index.ts

import type { SupportedLocale } from "@/types/common";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";


// Sepet item'ı; hangi ürün tipi olduğunu belirten bir alan ekliyoruz
export interface ICartItem {
  product: IBikes | IEnsotekprod | ISparepart | string;
  productType: "bike" | "ensotekprod" | "sparepart"; // Yeni alan: ürün tipi
  quantity: number;
  tenant: string;
  unitPrice: number;
  priceAtAddition: number;
  totalPriceAtAddition: number;
}

// Sepet (cart) ana tipi
export interface ICart {
  _id?: string;
  user?: string;
  tenant?: string;
  items: ICartItem[];
  totalPrice: number;
  couponCode?: string | null;
  status: "open" | "ordered" | "cancelled";
  isActive: boolean;
  discount?: number;
  language?: SupportedLocale;
  createdAt?: string;
  updatedAt?: string;
}
