import type { SupportedLocale } from "@/types/common";

// Payment yöntemi
export type PaymentMethod = "cash_on_delivery" | "credit_card" | "paypal";

// Sipariş durumu
export type OrderStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "delivered";

// Sipariş ürünü (cart item)
export interface IOrderItem {
  product: string; // veya Types.ObjectId
  quantity: number;
  tenant: string;
  unitPrice: number;
}

// Teslimat adresi
export interface IShippingAddress {
  name: string;
  phone: string;
  tenant: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Ana sipariş modeli
export interface IOrder {
  _id?: string;
  id?: string; // MongoDB ObjectId veya UUID
  user: string; // veya Types.ObjectId
  addressId?: string; // veya Types.ObjectId
  items: IOrderItem[];
  tenant: string;
  shippingAddress: IShippingAddress;
  totalPrice: number;
  discount?: number;
  coupon?: string; // veya Types.ObjectId
  paymentMethod: PaymentMethod;
  payments?: string[]; // veya Types.ObjectId[]
  status: OrderStatus;
  isDelivered: boolean;
  isPaid: boolean;
  deliveredAt?: string | Date;
  language?: SupportedLocale;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
interface ProductNameType {
  [lang: string]: string;
}


export interface ProductType {
  _id?: string;
  name?: ProductNameType;
  price?: number;
  [key: string]: any;
}

export interface OrderItemType {
  product?: ProductType | string;
  name?: string;
  quantity: number;
  priceAtAddition?: number;
  size?: string;
}

