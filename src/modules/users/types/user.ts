//types/user.d.ts
export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  }


// src/modules/users/types/user.ts
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
  addresses?: string[];
  socialMedia?: Record<string, string>;
  notifications?: Record<string, any>;
}




export interface Address {
  _id?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
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

export interface Account {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  addresses?: Address[];
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

  