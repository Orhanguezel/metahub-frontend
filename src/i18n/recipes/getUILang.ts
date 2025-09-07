// src/i18n/recipes/getUILang.ts
"use client";
import type { SupportedLocale, TranslatedLabel } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";

/* ───── UI dili (2 harf) ───── */
export const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

/* ───── TL helpers (merkezi) ───── */

/** Tüm diller için boş stringlerle base obje üret */
export const makeTL = (initial?: Partial<TranslatedLabel>): TranslatedLabel => {
  const base = SUPPORTED_LOCALES.reduce((acc, l) => {
    (acc as any)[l] = "";
    return acc;
  }, {} as TranslatedLabel);
  return { ...base, ...(initial || {}) };
};

/** Güvenli set: mevcut objeyi dillere genişletip ilgili dili yazar */
export const setTL = (
  obj: TranslatedLabel | undefined,
  l: SupportedLocale,
  val: string
): TranslatedLabel => ({ ...makeTL(obj), [l]: val });

/** DB’den gelen değeri sağlam TL’ye çevirir (string → {tr: s}, object → {…}, diğer → {}) */
export const toTL = (x: unknown): TranslatedLabel => {
  if (!x) return {};
  if (typeof x === "string") return { tr: x } as TranslatedLabel;
  if (typeof x === "object" && !Array.isArray(x)) {
    const out: TranslatedLabel = {};
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (typeof v === "string") (out as any)[k] = v;
    }
    return out;
  }
  return {};
};

/** Dili kesin ister; yoksa boş string döner (input value için birebir) */
export const getTLStrict = (obj: TranslatedLabel | undefined, l: SupportedLocale): string =>
  (obj && typeof obj === "object" ? (obj as any)[l] ?? "" : "");

/** Düşme sırası: lang → tr → en → ilk değer → "" (SEO/placeholder için uygun) */
export const getTL = (
  obj: TranslatedLabel | Record<string, string> | undefined,
  lang?: SupportedLocale
): string => {
  if (!obj) return "";
  if (lang && (obj as any)[lang]) return String((obj as any)[lang]);
  if ((obj as any).tr) return String((obj as any).tr);
  if ((obj as any).en) return String((obj as any).en);
  const first = Object.values(obj)[0];
  return typeof first === "string" ? first : "";
};

/** TL birleştirme (replace/merge) */
export const mergeTL = (
  curr: TranslatedLabel,
  next: TranslatedLabel,
  mode: "replace" | "merge" = "merge"
): TranslatedLabel => {
  if (mode === "replace") return toTL(next);
  const clean = Object.fromEntries(
    Object.entries(next || {}).filter(([, v]) => typeof v === "string" && (v as string).trim())
  ) as TranslatedLabel;
  return { ...(curr || {}), ...clean };
};
