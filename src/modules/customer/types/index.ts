import type { Address } from "@/modules/users/types/address";

export interface ICustomer {
  _id?: string;
  tenant: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  addresses?: Array<string | Address>;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
