import type { SupportedLocale } from "@/types/common";
import type { User } from "@/modules/users/types/user";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";

export type PaymentMethod = "cash_on_delivery" | "credit_card" | "paypal";
export type OrderStatus = "pending" | "preparing" | "shipped" | "completed" | "cancelled" |"delivered" ;

// --- Sipariş ürünü (cart item) ---
export interface IOrderItem {
  product: IBikes | IEnsotekprod | ISparepart | string;
  productType: "bike" | "ensotekprod" | "sparepart"; // Yeni alan: ürün tipi
  quantity: number;
  tenant: string;
  unitPrice: number;
  priceAtAddition: number;
  totalPriceAtAddition: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  tenant: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// --- Sipariş modeli ---
export interface IOrder {
  _id?: string;
  user: string | User; 
  addressId?: string;
  items: IOrderItem[];
  tenant: string;
  shippingAddress: IShippingAddress;
  totalPrice: number;
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


