// src/i18n/getUILang.ts
"use client";
import type { SupportedLocale,TranslatedLabel} from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";


/* --- helpers --- */
export const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

export const makeTL = (initial?: Partial<TranslatedLabel>): TranslatedLabel => {
  const base = SUPPORTED_LOCALES.reduce((acc, l) => {
    (acc as any)[l] = "";
    return acc;
  }, {} as TranslatedLabel);
  return { ...base, ...(initial || {}) };
};

export const setTL = (
  obj: TranslatedLabel | undefined,
  l: SupportedLocale,
  val: string
): TranslatedLabel => ({ ...makeTL(obj), [l]: val });
