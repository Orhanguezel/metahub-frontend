import type { TL } from "../types";
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";
import { TAG_CANON } from "@/modules/recipes/utils/ai.constants";

// FE helper'lar
export const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  const isSupported = (SUPPORTED_LOCALES as readonly string[]).includes(two);
  return (isSupported ? (two as SupportedLocale) : "tr");
};

export const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
export const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
export const toTL = (v: any): TL => (v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : {});
export const parseId = (x: any) => (typeof x === "string" ? x : x?.$oid || x?._id || x?.id || "");

// hafif slugify
export const slugifyLite = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

// text -> string[] (JSON dizi veya virgül)
export const parseArray = (txt: string): string[] => {
  try {
    const j = JSON.parse(txt);
    return Array.isArray(j) ? j.map(String).filter(Boolean) : [];
  } catch {
    return txt.split(",").map((s) => s.trim()).filter(Boolean);
  }
};

// AI'dan gelen çok dilli tag listesi -> canonical key listesi
export const mapAiTagsToKeys = (aiTags: any[]): string[] => {
  if (!Array.isArray(aiTags)) return [];
  const reverse: Record<string, string> = {};
  for (const [key, tl] of Object.entries(TAG_CANON)) {
    for (const val of Object.values(tl as any)) {
      const norm = String(val || "").toLowerCase();
      reverse[norm] = key;
      reverse[slugifyLite(norm)] = key;
    }
  }
  const keys: string[] = [];
  for (const tag of aiTags) {
    const vals = typeof tag === "string" ? [tag] : Object.values(tag || {});
    let mapped: string | undefined;
    for (const v of vals) {
      const norm = String(v || "").toLowerCase();
      mapped = reverse[norm] || reverse[slugifyLite(norm)];
      if (mapped) break;
    }
    keys.push(mapped || slugifyLite(String((tag?.en || tag?.tr || (vals?.[0] as any) || "tag"))));
  }
  return Array.from(new Set(keys));
};
