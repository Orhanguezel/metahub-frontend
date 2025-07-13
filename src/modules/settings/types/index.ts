import type { SupportedLocale, TranslatedLabel } from "@/types/common";

// Çoklu dil desteği için tekrar kullanılabilir type
export type TranslatedField = { [lang in SupportedLocale]?: string };

// Görsel nesne tipi (Backend ile birebir uyumlu)
export interface ISettingsImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

// Labeled link
export interface ILabeledLink {
  label: TranslatedLabel;
  href?: string;
  url?: string;
  icon?: string;
  tenant?: string;
}

// --- EKLEDİK: Nested TranslatedField tipi ---
export interface INavbarLogoTextValue {
  title: { label: TranslatedLabel; url?: string };
  slogan: { label: TranslatedLabel; url?: string };
}

export type ISettingValue =
  | string
  | string[]
  | TranslatedLabel
  | Record<string, ILabeledLink>
  | Record<string, any>
  | INavbarLogoTextValue // BUNU EKLEDİK
  | { href: string; icon: string }
  | { phone: string };

// Asıl Settings Modeli
export interface ISetting {
  key: string;
  tenant: string;
  value: ISettingValue;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: ISettingsImage[];
}
