export type AddressType = "home" | "work" | "billing" | "shipping" | "factory" | "other";
export const ADDRESS_TYPE_OPTIONS: AddressType[] = [
  "home", "work", "billing", "shipping", "factory", "other"
];

export interface Address {
  _id?: string;
  addressType: AddressType;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;       // frontend'de input, backend postalCode ile mapli!
  phone: string;
  email: string;
  country: string;
  isDefault?: boolean;
  userId?: string;
  companyId?: string;
  tenant?: string;
  postalCode?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
