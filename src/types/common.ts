// src/types/common.ts

// Desteklenen diller (i18n, date-fns vs. ile tam uyumlu!)
export type SupportedLocale = "tr" | "en" | "de" | "pl" | "fr" | "es";
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  "tr", "en", "de", "pl", "fr", "es"
];

// Dil label'ları
export const LANG_LABELS: Record<SupportedLocale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  fr: "Français",
  es: "Español"
};

// Date formatları (ülke/bölgeye göre)
export const DATE_FORMATS: Record<SupportedLocale, string> = {
  tr: "dd.MM.yyyy",
  en: "yyyy-MM-dd",
  de: "dd.MM.yyyy",
  pl: "yyyy-MM-dd",
  fr: "dd/MM/yyyy",
  es: "dd/MM/yyyy"
};

// Locale string mapping (örn. date-fns/Intl için)
export const LOCALE_MAP: Record<SupportedLocale, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  pl: "pl-PL",
  fr: "fr-FR",
  es: "es-ES"
};

// Çoklu dil destekli label tipleri
export type TranslatedLabel = { [key in SupportedLocale]: string };

// Ülke kodları (address form/selector için)
export type CountryCode = "TR" | "DE" | "EN" | "FR" | "ES" | "PL";
export const COUNTRY_OPTIONS: CountryCode[] = ["TR", "DE", "EN", "FR", "ES", "PL"];

// Fonksiyon: locale stringi döndür
export function getLocaleStringFromLang(lang: SupportedLocale): string {
  return LOCALE_MAP[lang] || "tr-TR";
}

// Çoklu dil fallback yardımcı fonksiyonları
export function getTitle(
  item: { title?: Partial<TranslatedLabel> },
  lang: SupportedLocale
): string {
  return (
    item.title?.[lang] ||
    item.title?.en ||
    Object.values(item.title || {})[0] ||
    "-"
  );
}

export function getSummary(
  item: { summary?: Partial<TranslatedLabel> },
  lang: SupportedLocale
): string {
  return (
    item.summary?.[lang] ||
    item.summary?.en ||
    Object.values(item.summary || {})[0] ||
    "-"
  );
}

// Tek bir objede çoklu dil fallback (generic)
export function getMultiLang(
  obj?: Partial<TranslatedLabel> | Record<string, string>,
  lang?: SupportedLocale
): string {
  if (!lang) return obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";
  return obj?.[lang] || obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";
}
