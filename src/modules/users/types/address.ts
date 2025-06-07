// src/modules/users/types/address.ts

export interface Address {
  _id?: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
