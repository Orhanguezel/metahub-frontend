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

// ========================
// Locale mapping for Date
// ========================
export const LOCALE_MAP: Record<SupportedLocale, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  pl: "pl-PL",
  fr: "fr-FR",
  es: "es-ES",
};

export function getLocaleStringFromLang(lang: SupportedLocale): string {
  return LOCALE_MAP[lang] || "tr-TR";
}

// ========================
// Universal fallback helpers
// ========================
export function getTitle(
  item: { title?: Partial<TranslatedLabel> },
  lang: SupportedLocale
): string {
  return (
    item.title?.[lang] ||
    item.title?.en ||
    item.title?.tr ||
    item.title?.de ||
    item.title?.pl ||
    item.title?.fr ||
    item.title?.es ||
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
    item.summary?.tr ||
    item.summary?.de ||
    item.summary?.pl ||
    item.summary?.fr ||
    item.summary?.es ||
    Object.values(item.summary || {})[0] ||
    "-"
  );
}

// Çoklu dil destekli fallback fonksiyonu
export function getMultiLang(
  obj?: Partial<TranslatedLabel> | Record<string, string>,
  lang?: SupportedLocale
): string {
  // Lang verilmemişse önce tr, sonra en ve ilk değer fallback
  if (!lang) {
    return obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";
  }
  return obj?.[lang] || obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";
}

