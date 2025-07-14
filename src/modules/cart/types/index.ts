// src/modules/cart/types/index.ts

import type { IBikes } from "@/modules/bikes";


export interface ICartItem {
  product: IBikes | string; 
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
