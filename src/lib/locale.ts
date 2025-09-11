// src/lib/locale.ts
import { getUILang } from "@/i18n/recipes/getUILang";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";

/** (mevcut) client tarafı locale çözümü */
export function resolveClientLocale(i18n?: any): SupportedLocale {
  const fromI18n = i18n?.resolvedLanguage || i18n?.language || "";
  const fromDoc  = typeof document !== "undefined" ? document.documentElement.lang : "";
  const fromCk   = typeof document !== "undefined"
    ? (document.cookie.match(/(?:^|;\s*)(?:locale|NEXT_LOCALE)=([a-z-]+)/i)?.[1] || "")
    : "";
  const fromNav  = typeof navigator !== "undefined" ? navigator.language : "";

  const cand = getUILang(fromI18n) || getUILang(fromDoc) || getUILang(fromCk) || getUILang(fromNav);
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(cand)
    ? (cand as SupportedLocale)
    : ("de" as SupportedLocale);
}

/** Accept-Language başlığından desteklenen dili seçer (server-safe) */
export function pickFromAcceptLanguage(al: string | null): SupportedLocale | null {
  if (!al) return null;
  const items = al
    .split(",")
    .map((s) => {
      const [tag, qPart] = s.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      const primary = (tag.split("-")[0] || "").toLowerCase();
      return { primary, q };
    })
    .filter(Boolean)
    .sort((a, b) => b.q - a.q);

  for (const { primary } of items) {
    if ((SUPPORTED_LOCALES as ReadonlyArray<string>).includes(primary)) {
      return primary as SupportedLocale;
    }
  }
  return null;
}
