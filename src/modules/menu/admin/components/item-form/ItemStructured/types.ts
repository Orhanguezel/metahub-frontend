import type { SupportedLocale, TranslatedLabel } from "@/types/common";

export type MenuCategory = {
  _id: string;
  code?: string;
  slug?: string;
  name?: TranslatedLabel;
  images?: any[];
  order?: number;
};

export type StructuredObj = {
  categories?: any[];
  variants?: any[];
  modifierGroups?: any[];
  allergens?: any[];
  additives?: any[];
  dietary?: any;
  ops?: any;
};

export type TFunc = (k: string, d?: string) => string;

export type TLGetter = (obj?: TranslatedLabel, l?: SupportedLocale) => string;
