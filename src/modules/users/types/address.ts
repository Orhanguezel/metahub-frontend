// src/modules/users/types/address.ts

export interface Address {
  _id?: string;                         // MongoDB ObjectId veya string (frontendde her zaman string, populated ise obje olabilir)
  userId?: string;                      // Adresi oluşturan user (opsiyonel, populated response'ta olabilir)
  companyId?: string;                   // Firma adresi için (opsiyonel, populated response'ta olabilir)
  tenant?: string;                      // Multi-tenant sistemler için (opsiyonel)
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;                      // Zorunlu alan
  isDefault?: boolean;
  createdAt?: Date | string;            // Date veya ISO string
  updatedAt?: Date | string;
}
