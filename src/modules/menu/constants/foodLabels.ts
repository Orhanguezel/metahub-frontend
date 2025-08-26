// src/modules/menu/constants/foodLabels.ts
import { useMemo, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TranslatedLabel,
} from "@/types/common";
import type {
  PriceChannel,
  PriceKind,
} from "@/modules/menu/types/menuitem";
import { getUILang } from "@/i18n/getUILang";

/* ----------------------- Kod tipleri ----------------------- */
export type AdditiveCode =
  | "1" | "2" | "3" | "4" | "5" | "6" | "7"
  | "8" | "9" | "10" | "11" | "12" | "13";

export type AllergenCode =
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i"
  | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r";

/* Sabit varyant/sizes kodları (ihtiyaca göre genişletebilirsin) */
export const VARIANT_CODES = ["S","M","L","REG","XL"] as const;
export type VariantCode = typeof VARIANT_CODES[number];

export const PRICE_KIND_KEYS: PriceKind[] = ["base","deposit","surcharge","discount"];
export const CHANNEL_KEYS: PriceChannel[] = ["delivery","pickup","dinein"];

/* ------------------ TL üreticileri (genel) ------------------ */
type RootNs = "additives" | "allergens";
type MenuNsPath = "variants.names" | "variants.sizes" | "price.kind" | "channels" | "dietary";

/** menu kökünde iç içe path okuyan yardımcı */
const getMenuPathValue = (lng: SupportedLocale, nsPath: MenuNsPath, code: string) => {
  const parts = nsPath.split(".");
  let node: any = (translations as any)?.[lng]?.menu;
  for (const p of parts) node = node?.[p];
  return node?.[code];
};

/** ADDITIVE/ALLERGEN için (root veya menu sözlüğü) */
const buildTL = (ns: RootNs, code: string): TranslatedLabel =>
  SUPPORTED_LOCALES.reduce<TranslatedLabel>((acc, lng) => {
    const vMenu = (translations as any)?.[lng]?.menu?.[ns]?.[code];
    const vRoot = (translations as any)?.[lng]?.[ns]?.[code];
    const v = vMenu ?? vRoot;
    acc[lng] = (typeof v === "string" && v.trim()) ? v : code;
    return acc;
  }, {} as TranslatedLabel);

/** menu.* içinde iç içe path kullanan TL üretici (ör: "variants.names") */
export const buildMenuTL = (nsPath: MenuNsPath, code: string): TranslatedLabel =>
  SUPPORTED_LOCALES.reduce<TranslatedLabel>((acc, lng) => {
    const v = getMenuPathValue(lng, nsPath, code);
    acc[lng] = (typeof v === "string" && v.trim()) ? v : code;
    return acc;
  }, {} as TranslatedLabel);

/** Tek dil label (hook’suz) */
export const getLabelNested = (nsPath: MenuNsPath, code: string, lng: SupportedLocale): string =>
  getMenuPathValue(lng, nsPath, code) ?? code;

/* ------------------ Sabit sözlükler ------------------ */
export const ADDITIVE_KEYS = [
  "1","2","3","4","5","6","7","8","9","10","11","12","13",
] as const satisfies ReadonlyArray<AdditiveCode>;

export const ALLERGEN_KEYS = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r",
] as const satisfies ReadonlyArray<AllergenCode>;

export const ADDITIVES = ADDITIVE_KEYS.map((key) => ({
  key,
  value: buildTL("additives", key),
})) as readonly { key: AdditiveCode; value: TranslatedLabel }[];

export const ALLERGENS = ALLERGEN_KEYS.map((key) => ({
  key,
  value: buildTL("allergens", key),
})) as readonly { key: AllergenCode; value: TranslatedLabel }[];

export const ADDITIVE_MAP: Readonly<Record<AdditiveCode, TranslatedLabel>> =
  Object.fromEntries(ADDITIVES.map((a) => [a.key, a.value])) as Record<AdditiveCode, TranslatedLabel>;

export const ALLERGEN_MAP: Readonly<Record<AllergenCode, TranslatedLabel>> =
  Object.fromEntries(ALLERGENS.map((a) => [a.key, a.value])) as Record<AllergenCode, TranslatedLabel>;

/* İsteğe bağlı: varyant adları ve size etiketleri için TL map’leri */
export const VARIANT_NAME_MAP: Readonly<Record<string, TranslatedLabel>> =
  Object.fromEntries(VARIANT_CODES.map((c) => [c, buildMenuTL("variants.names", c)]));

export const SIZE_LABEL_MAP: Readonly<Record<string, TranslatedLabel>> =
  Object.fromEntries(VARIANT_CODES.map((c) => [c, buildMenuTL("variants.sizes", c)]));

/* ------------------ UI yardımcı hook’ları ------------------ */
export function useFoodLabelHelpers() {
  const { i18n, t } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const additivesLocalized = useMemo(
    () => ADDITIVE_KEYS.map((key) => ({ key, label: String(t(`additives.${key}`)) })),
    [t]
  );
  const allergensLocalized = useMemo(
    () => ALLERGEN_KEYS.map((key) => ({ key, label: String(t(`allergens.${key}`)) })),
    [t]
  );

  const priceKindLabel = useCallback((k: PriceKind) => String(t(`price.kind.${k}`)), [t]);
  const channelLabel   = useCallback((c: PriceChannel) => String(t(`channels.${c}`)), [t]);

  const variantNameLabel = useCallback((code: string) => getLabelNested("variants.names", code, lang), [lang]);
  const sizeLabelLabel   = useCallback((code: string) => getLabelNested("variants.sizes", code, lang), [lang]);

  return {
    lang,
    additivesLocalized,
    allergensLocalized,
    priceKindLabel,
    channelLabel,
    variantNameLabel,
    sizeLabelLabel,
  };
}

/* Hook kullanmadan tek dil label (root veya menu.*) */
export const getLabelFor = (ns: "additives" | "allergens", code: string, lng: SupportedLocale): string =>
  (translations as any)?.[lng]?.menu?.[ns]?.[code]
  ?? (translations as any)?.[lng]?.[ns]?.[code]
  ?? code;
