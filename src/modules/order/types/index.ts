// Siparişteki ürün satırı tipi (populate destekli)
export interface PopulatedProduct {
  _id: string;
  name: { en?: string; tr?: string; de?: string } | string;
  // Diğer gerekli alanlar eklenebilir (örn: images vs.)
}

export interface OrderItem {
  product: string | PopulatedProduct;
  quantity: number;
  unitPrice: number;
}

// Adres tipi
export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Sipariş durumları
export type PaymentMethod = "cash_on_delivery";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

// Sipariş ana tipi (Redux ve backend ile uyumlu)
export interface Order {
  _id?: string;
  user: string | { _id: string; name?: string; email?: string }; // populate veya id
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
  isDelivered?: boolean;
  isPaid?: boolean;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  language?: "tr" | "en" | "de";
}

// Liste response'u
export interface OrderListResponse {
  success: boolean;
  message: string;
  data: Order[];
}

// Tekil sipariş response'u
export interface OrderSingleResponse {
  success: boolean;
  message: string;
  data: Order;
}
