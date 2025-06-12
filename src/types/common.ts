// src/types/common.ts
export type SupportedLocale = "tr" | "en" | "de" | "pl" | "fr" | "es";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["tr", "en", "de", "pl", "fr", "es"];

export type TranslatedLabel = { [key in SupportedLocale]: string };

export const LANG_LABELS: Record<SupportedLocale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  fr: "Français",
  es: "Español"
};

export const DATE_FORMATS: Record<SupportedLocale, string> = {
  tr: "dd.MM.yyyy",
  en: "yyyy-MM-dd",
  de: "dd.MM.yyyy",
  pl: "yyyy-MM-dd",
  fr: "dd/MM/yyyy",
  es: "dd/MM/yyyy",
};
