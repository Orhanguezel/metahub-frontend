// src/types/company.ts (Frontend)
import type { SupportedLocale } from "@/types/common";
import type { Address } from "@/modules/users/types/address";

export type TranslatedLabel = { [key in SupportedLocale]: string };

export interface ICompanyImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

export interface ISocialLink {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface ICompany {
  _id?: string;
  companyName: TranslatedLabel;                  // Çoklu dil
  companyDesc?: TranslatedLabel;                 // Çoklu dil
  tenant: string;
  language: string;                              // "en" | "de" | "tr" | ...
  taxNumber: string;
  handelsregisterNumber?: string;
  registerCourt?: string;
  website?: string;
  email: string;
  phone: string;
  addresses?: Array<string | Address>;                    // Address _id referans array
  bankDetails: {
    bankName: string;
    iban: string;
    swiftCode: string;
  };
  managers?: string[];
  images?: ICompanyImage[];
  socialLinks?: ISocialLink;
  createdAt: string | Date;
  updatedAt: string | Date;
}
