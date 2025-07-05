// src/utils/getCurrentLocale.ts
import i18n from "@/i18n";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

export function getCurrentLocale(): SupportedLocale {
  const lang = (i18n.language?.split("-")[0] ||
    (typeof navigator !== "undefined" && navigator.language?.split("-")[0]) ||
    "en") as string;

  // Eğer sistemde olmayan bir dil seçildiyse fallback 'en'
  return (
    SUPPORTED_LOCALES.includes(lang as SupportedLocale) ? lang : "en"
  ) as SupportedLocale;
}
