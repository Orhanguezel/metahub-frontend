// src/modules/cart/types/index.ts

import type { Iradonarprod } from "@/modules/product";


export interface ICartItem {
  product: Iradonarprod | string; 
  quantity: number;
  priceAtAddition: number;
  totalPriceAtAddition: number;
}

// Sepet (cart) ana tipi
export interface ICart {
  _id?: string;
  user?: string; 
  items: ICartItem[];
  totalPrice: number;
  couponCode?: string | null;
  status: "open" | "ordered" | "cancelled";
  isActive: boolean;
  discount?: number;
  createdAt?: string; 
  updatedAt?: string;
}
