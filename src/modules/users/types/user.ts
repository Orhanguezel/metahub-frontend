import type { Address } from "./address";
import type { SupportedLocale } from "@/types/common";

// --- Profile Image tipin tek hali ---
export type ProfileImageObj = {
  url?: string;
  thumbnail?: string;
  webp?: string;
  publicId?: string;
  [key: string]: any;
};

// --- User (DB) ---
export interface User {
  _id: string;
  name: string;
  company?: string; // Yeni: Kullanıcının şirketi
  customerId?: string; // Yeni: Kullanıcının müşteri ID'si
  position?: string; // Yeni: Kullanıcının pozisyonu
  tenant: string; // Yeni: Tenant ID
  email: string;
  role: "superadmin" | "admin" | "user" | "moderator" | "staff" | "customer";
  isActive: boolean;
  profileImage?: string | ProfileImageObj; // ⚡️ Hem eski (string) hem yeni (obj) destek!
  phone?: string;
  bio?: string;
  birthDate?: string;
  addresses?: Address[];
  socialMedia?: Record<string, string>;
  notifications?: Record<string, any>;
}

// --- Account (Frontend oturum) ---
export interface Account {
  _id: string;
  name: string;
  company?: string; // Yeni: Kullanıcının şirketi
  customerId?: string; // Yeni: Kullanıcının müşteri ID'si
  position?: string; // Yeni: Kullanıcının pozisyonu
  tenant: string; // Yeni: Tenant ID
  email: string;
  role?: "superadmin" | "admin" | "user" | "moderator" | "staff" | "customer"; // 🟢 ARTIK VAR
  isActive?: boolean;            // Eklenmesi önerilir (dashboard için vs.)
  profileImage?: string | ProfileImageObj | null;
  phone?: string;
  bio?: string;
  birthDate?: string;
  addresses?: Address[];
  addressesPopulated?: Address[];
  notifications?: NotificationSettings;
  socialMedia?: SocialMediaLinks;
  language?: SupportedLocale;
  favorites?: any[];
  cart?: any;
  orders?: any[];
  payment?: any;
  profile?: any;
}

// --- Bildirim Ayarları ---
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// --- Sosyal Medya ---
export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}
