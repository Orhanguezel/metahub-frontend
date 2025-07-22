// src/modules/users/types/address.ts

export interface Address {
  _id?: string;                   // MongoDB ObjectId veya string
  userId?: string;                // Adresin sahibi (opsiyonel; populated response’larda olabilir)
  tenant?: string;                // Multi-tenant destekli projede tenant kodu (opsiyonel, backend varsa ekle)
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
