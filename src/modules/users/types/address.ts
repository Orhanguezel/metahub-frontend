// src//modules/users/types/address.ts

export type AddressType =
  | "home"
  | "work"
  | "billing"
  | "shipping"
  | "factory"
  | "warehouse"
  | "showroom"
  | "branch"
  | "other";

export const ADDRESS_TYPE_OPTIONS: AddressType[] = [
  "home", "work", "billing", "shipping", "factory",
  "warehouse", "showroom", "branch", "other"
];

// Final Address interface (Her ülke için uygun!)
export interface Address {
  _id?: string;
  addressType: AddressType;    // ZORUNLU
  addressLine: string;         // ZORUNLU (her zaman en az 1 satır!)
  userId?: string;
  companyId?: string;
  tenant?: string;
  isDefault?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Ülkeye göre opsiyoneller:
  street?: string;
  houseNumber?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}
