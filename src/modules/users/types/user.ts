// src/modules/users/types/user.ts

import type { Address } from "./address"; // Yukarıda tanımlanan Address tipi import ediliyor

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator" | "staff" | "customer";
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  birthDate?: string;
  addresses?: Address[]; // Array of Address type
  socialMedia?: Record<string, string>;
  notifications?: Record<string, any>;
}


export interface Account {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  addresses?: Address[];  // Address[] ile birebir uyumlu!
  notifications?: NotificationSettings;
  socialMedia?: SocialMediaLinks;
  language?: "tr" | "en" | "de";
  favorites?: any[];
  bio?: string;
  birthDate?: string;
  cart?: any;
  orders?: any[];
  payment?: any;
  profile?: any;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}
