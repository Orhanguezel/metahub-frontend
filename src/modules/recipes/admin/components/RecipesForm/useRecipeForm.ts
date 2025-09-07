"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import type { IRecipe, IRecipeImage } from "@/modules/recipes/types";
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";
import {
  PREFERRED_CANONICAL_ORDER,
  TAG_CANON,
  canonicalizeCuisine,
} from "@/modules/recipes/utils/ai.constants";
import type { TL, UploadImage } from "@/modules/recipes/types";

import {
  getUILang,
  toTL,
  setTL,
  getTLStrict,
  getTL,
  mergeTL,
} from "@/i18n/recipes/getUILang";

import {
  parseId,
  slugifyLite,
  mapAiTagsToKeys,
} from "@/modules/recipes/utils/utils";

export type RecipeJSON = {
  _id?: any;
  tenant?: string;
  slugCanonical?: string;
  slug?: TL;
  isActive?: boolean;
  isPublished?: boolean;
  order?: number;
  title?: TL;
  description?: TL;
  categories?: string[];
  cuisines?: string[];
  tags?: any[];
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  calories?: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  ingredients?: any[];
  steps?: any[];
  createdAt?: string | null;
  updatedAt?: string | null;
  __v?: number;
};

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }
function csvToArr(s: string) { return s.split(",").map(x => x.trim()).filter(Boolean); }
function arrToCsv(a?: string[]) { return (a || []).join(", "); }
function extractId(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  if ((val as any)?.$oid) return String((val as any).$oid);
  return String(val);
}
function extractDateISO(val: any): string | undefined {
  if (!val) return undefined;
  const raw = (val as any)?.$date ?? val;
  try { return new Date(raw).toISOString(); } catch { return undefined; }
}
function flattenTagsToStrings(raw: any[]): string[] {
  return (raw || []).map(t => typeof t === "string"
    ? t
    : (t?.en || t?.tr || Object.values(t || {})[0] || "")
  ).filter(Boolean);
}

export function useRecipeForm(
  initial: IRecipe | null | undefined,
  onSubmit: (fd: FormData, id?: string)=>Promise<void>|void
) {
  const { t: i18nT, i18n } = useI18nNamespace("recipes", translations);
  const t = useCallback((k: string, d?: string) => i18nT(k, { defaultValue: d }), [i18nT]);

  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const [editLang, setEditLang] = useState<SupportedLocale>(uiLang);
  const isEdit = Boolean((initial as any)?._id);

  const [editMode, setEditMode] = useState<"simple"|"json">("simple");
  const [aiOpen, setAiOpen] = useState(false);

  // Sluglar
  const [slugCanonical, setSlugCanonical] = useState<string>("");
  const [slugMap, setSlugMap] = useState<TL>({});
  const [autoSlug, setAutoSlug] = useState<boolean>(true);

  // Çok dilli alanlar
  const [title, setTitle] = useState<TL>({});
  const [description, setDescription] = useState<TL>({});

  // Basit alanlar
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Meta
  const [meta, setMeta] = useState<{ _id?: any; tenant?: string; createdAt?: string; updatedAt?: string; __v?: number }>({});

  // İlişkiler
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // Cuisines & Tags
  const [cuisinesStr, setCuisinesStr] = useState<string>("");
  const [tagsStr, setTagsStr] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsRaw, setTagsRaw] = useState<any[]>([]);

  // Sayısal
  const [servings, setServings] = useState<number | undefined>(undefined);
  const [prepMinutes, setPrepMinutes] = useState<number | undefined>(undefined);
  const [cookMinutes, setCookMinutes] = useState<number | undefined>(undefined);
  const [totalMinutes, setTotalMinutes] = useState<number | undefined>(undefined);
  const [autoTotal, setAutoTotal] = useState<boolean>(true);
  const [calories, setCalories] = useState<number | undefined>(undefined);

  // Tarihler
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [effectiveTo, setEffectiveTo] = useState<string>("");

  // İçerik
  const [ingredientsJson, setIngredientsJson] = useState<any[]>([]);
  const [stepsJson, setStepsJson] = useState<any[]>([]);

  // Görseller
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // ===== INIT =====
  useEffect(() => {
    // meta
    setMeta({
      _id: (initial as any)?._id,
      tenant: (initial as any)?.tenant,
      createdAt: extractDateISO((initial as any)?.createdAt),
      updatedAt: extractDateISO((initial as any)?.updatedAt),
      __v: (initial as any)?.__v,
    });

    // sluglar
    setSlugCanonical((initial as any)?.slugCanonical || "");
    setSlugMap(toTL((initial as any)?.slug));

    // çok dilli alanlar
    setTitle(toTL((initial as any)?.title));
    setDescription(toTL((initial as any)?.description));

    // basit
    setOrder(Number((initial as any)?.order ?? 0));
    setIsActive((initial as any)?.isActive ?? true);
    setIsPublished((initial as any)?.isPublished ?? true);

    // kategoriler
    const catsFromInitial: string[] = Array.isArray(initial?.categories)
      ? (initial!.categories as any[]).map(parseId).filter(Boolean)
      : [];
    setCategoryIds(catsFromInitial);

    // cuisines
    setCuisinesStr(Array.isArray(initial?.cuisines) ? (initial!.cuisines as string[]).join(", ") : "");

    // tags
    const rawTags = Array.isArray((initial as any)?.tags) ? (initial as any).tags : [];
    setTagsRaw(rawTags);
    const flatTags = flattenTagsToStrings(rawTags);
    setTagsStr(flatTags.join(", "));
    setSelectedTags(flatTags);

    // sayısal
    setServings((initial as any)?.servings);
    setPrepMinutes((initial as any)?.prepMinutes);
    setCookMinutes((initial as any)?.cookMinutes);
    setTotalMinutes((initial as any)?.totalMinutes);
    setCalories((initial as any)?.calories);

    // tarihler
    setEffectiveFrom((initial as any)?.effectiveFrom ? new Date((initial as any).effectiveFrom).toISOString().slice(0, 16) : "");
    setEffectiveTo((initial as any)?.effectiveTo ? new Date((initial as any).effectiveTo).toISOString().slice(0, 16) : "");

    // içerik
    setIngredientsJson(((initial as any)?.ingredients) || []);
    setStepsJson(((initial as any)?.steps) || []);

    // görseller
    const imgs = ((initial?.images || []) as IRecipeImage[]).map(img => ({
      url: img.url, thumbnail: img.thumbnail, webp: img.webp, publicId: img.publicId,
    }));
    setExistingUploads(imgs);
    setRemovedExisting([]);
    setNewFiles([]);
  }, [initial]);

  // başlıktan slug
  const canonicalTitle = useMemo(() => {
    for (const l of PREFERRED_CANONICAL_ORDER) {
      const v = (title as any)?.[l];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    const v1 = getTLStrict(title as any, editLang);
    if (v1) return v1;
    const anyVal = Object.values(title || {}).find((x) => typeof x === "string" && x.trim());
    return (anyVal as string) || "";
  }, [title, editLang]);

  useEffect(() => {
    if (!autoSlug) return;
    const curr = getTLStrict(slugMap as any, editLang);
    const base = getTLStrict(title as any, editLang) || canonicalTitle;
    if (!curr && base) setSlugMap(prev => setTL(prev as any, editLang, slugifyLite(base)) as any);
  }, [autoSlug, title, editLang, canonicalTitle, slugMap]);

  // total = prep + cook
  useEffect(() => {
    if (!autoTotal) return;
    const p = Number(prepMinutes || 0);
    const c = Number(cookMinutes || 0);
    const sum = p + c;
    if (Number.isFinite(sum)) setTotalMinutes(sum);
  }, [autoTotal, prepMinutes, cookMinutes]);

  const tagSuggestions = useMemo(() => {
    const entries = Object.entries(TAG_CANON) as [string, any][];
    return entries.map(([key, tl]) => ({ key, label: (tl as any)[editLang] || (tl as any).en || key }));
  }, [editLang]);

  const toggleTag = (key: string) => {
    const has = selectedTags.includes(key);
    const next = has ? selectedTags.filter((k) => k !== key) : [...selectedTags, key];
    setSelectedTags(next);
    setTagsStr(next.join(", "));
  };

  const applyCuisineCanon = () => {
    const arr = csvToArr(cuisinesStr).map(canonicalizeCuisine);
    const uniqArr = uniq(arr);
    setCuisinesStr(arrToCsv(uniqArr));
  };

  // simple modda tagsRaw’ı senkronla
  useEffect(() => {
    if (editMode === "json") return;
    const free = csvToArr(tagsStr);
    const union = uniq([...(selectedTags || []), ...free]);
    setTagsRaw(union);
  }, [selectedTags, tagsStr, editMode]);

  // AI’den geleni uygula
  const applyAiToForm = (ai: any, mode: "replace" | "merge") => {
    setTitle((c) => mergeTL(c as any, toTL(ai?.title) as any, mode) as any);
    setDescription((c) => mergeTL(c as any, toTL(ai?.description) as any, mode) as any);

    if (mode === "replace" || !slugCanonical) setSlugCanonical(ai?.slugCanonical || slugCanonical);
    const s = (ai?.slug?.[editLang] || ai?.slug?.en || ai?.slugCanonical || "");
    if ((mode === "replace" || !getTLStrict(slugMap as any, editLang)) && s) {
      setSlugMap(prev => setTL(prev as any, editLang, slugifyLite(String(s || ""))) as any);
    }

    const cuisines: string[] = Array.isArray(ai?.cuisines) ? ai.cuisines.map(canonicalizeCuisine) : [];
    if (mode === "replace" || !cuisinesStr) setCuisinesStr(arrToCsv(cuisines));

    const keys = mapAiTagsToKeys(ai?.tags || []);
    if (keys.length) {
      if (mode === "replace") { setSelectedTags(keys); setTagsStr(keys.join(", ")); }
      else { const union = uniq([...(selectedTags || []), ...keys]); setSelectedTags(union); setTagsStr(union.join(", ")); }
    }

    const setNumber = (setter: (n?: number) => void, val: any) => { const n = Number(val); if (Number.isFinite(n)) setter(n); };
    if (mode === "replace" || servings == null) setNumber(setServings, ai?.servings);
    if (mode === "replace" || prepMinutes == null) setNumber(setPrepMinutes, ai?.prepMinutes);
    if (mode === "replace" || cookMinutes == null) setNumber(setCookMinutes, ai?.cookMinutes);
    if (mode === "replace" || totalMinutes == null) setNumber(setTotalMinutes, ai?.totalMinutes);
    if (mode === "replace" || calories == null) setNumber(setCalories, ai?.calories);

    if (typeof ai?.isPublished === "boolean" && (mode === "replace")) setIsPublished(ai.isPublished);
    if (typeof ai?.isActive === "boolean" && (mode === "replace")) setIsActive(ai.isActive);

    if (Array.isArray(ai?.ingredients)) setIngredientsJson(mode === "replace" ? ai.ingredients : [...(ingredientsJson || []), ...ai.ingredients]);
    if (Array.isArray(ai?.steps)) setStepsJson(mode === "replace" ? ai.steps : [...(stepsJson || []), ...ai.steps]);
  };

  // JSON mode value
  const recipeJsonValue: RecipeJSON = useMemo(() => {
    const cuisines = csvToArr(cuisinesStr).map(canonicalizeCuisine);
    return {
      _id: meta._id, tenant: meta.tenant, createdAt: meta.createdAt || null, updatedAt: meta.updatedAt || null, __v: meta.__v,
      slugCanonical, slug: slugMap,
      isActive, isPublished, order,
      title, description,
      categories: categoryIds,
      cuisines, tags: tagsRaw,
      servings, prepMinutes, cookMinutes, totalMinutes, calories,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : null,
      effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
      ingredients: ingredientsJson, steps: stepsJson,
    };
  }, [
    meta, slugCanonical, slugMap, isActive, isPublished, order, title, description,
    categoryIds, cuisinesStr, tagsRaw, servings, prepMinutes, cookMinutes, totalMinutes,
    calories, effectiveFrom, effectiveTo, ingredientsJson, stepsJson
  ]);

  const applyJsonToState = (v: any) => {
    const j: RecipeJSON = (v && typeof v === "object") ? v : {};
    setMeta({
      _id: j._id ?? meta._id, tenant: j.tenant ?? meta.tenant,
      createdAt: j.createdAt ?? meta.createdAt, updatedAt: j.updatedAt ?? meta.updatedAt,
      __v: j.__v ?? meta.__v,
    });
    if (typeof j.slugCanonical === "string") setSlugCanonical(j.slugCanonical);
    if (j.slug && typeof j.slug === "object") setSlugMap(toTL(j.slug));
    if (typeof j.isActive === "boolean") setIsActive(j.isActive);
    if (typeof j.isPublished === "boolean") setIsPublished(j.isPublished);
    if (typeof j.order === "number") setOrder(j.order);
    if (j.title) setTitle(toTL(j.title));
    if (j.description) setDescription(toTL(j.description));
    if (Array.isArray(j.categories)) setCategoryIds(j.categories.map(String));
    if (Array.isArray(j.cuisines)) setCuisinesStr(arrToCsv(j.cuisines.map(canonicalizeCuisine)));
    if (Array.isArray(j.tags)) { setTagsRaw(j.tags); const flat = flattenTagsToStrings(j.tags); setSelectedTags(flat); setTagsStr(flat.join(", ")); }
    if (j.servings != null) setServings(Number(j.servings));
    if (j.prepMinutes != null) setPrepMinutes(Number(j.prepMinutes));
    if (j.cookMinutes != null) setCookMinutes(Number(j.cookMinutes));
    if (j.totalMinutes != null) setTotalMinutes(Number(j.totalMinutes));
    if (j.calories != null) setCalories(Number(j.calories));
    setEffectiveFrom(j.effectiveFrom ? new Date(j.effectiveFrom).toISOString().slice(0,16) : "");
    setEffectiveTo(j.effectiveTo ? new Date(j.effectiveTo).toISOString().slice(0,16) : "");
    if (Array.isArray(j.ingredients)) setIngredientsJson(j.ingredients);
    if (Array.isArray(j.steps)) setStepsJson(j.steps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(ingredientsJson || []).length) { alert(t("ingredients_required", "Lütfen malzemeleri girin.")); return; }
    if (!(stepsJson || []).length) { alert(t("steps_required", "Lütfen adımları girin.")); return; }

    const fd = new FormData();
    // temel ve çok dilli alanlar
    fd.append("slugCanonical", slugCanonical || "");
    fd.append("slug", JSON.stringify(slugMap || {}));
    fd.append("isActive", String(isActive));
    fd.append("isPublished", String(isPublished));
    fd.append("order", String(Number(order) || 0));
    fd.append("title", JSON.stringify(title || {}));
    fd.append("description", JSON.stringify(description || {}));

    // ilişkiler ve diziler
    if (categoryIds.length) fd.append("categories", JSON.stringify(categoryIds));
    const cuisines = csvToArr(cuisinesStr);
    if (cuisines.length) fd.append("cuisines", JSON.stringify(cuisines));

    if (editMode === "json") fd.append("tags", JSON.stringify(tagsRaw || []));
    else {
      const freeTags = csvToArr(tagsStr);
      const unionTags = uniq([...(selectedTags || []), ...freeTags]);
      if (unionTags.length) fd.append("tags", JSON.stringify(unionTags));
    }

    // sayısal alanlar
    if (servings != null) fd.append("servings", String(servings));
    if (prepMinutes != null) fd.append("prepMinutes", String(prepMinutes));
    if (cookMinutes != null) fd.append("cookMinutes", String(cookMinutes));
    if (totalMinutes != null) fd.append("totalMinutes", String(totalMinutes));
    if (calories != null) fd.append("calories", String(calories));

    // tarihler
    if (effectiveFrom) fd.append("effectiveFrom", new Date(effectiveFrom).toISOString());
    if (effectiveTo) fd.append("effectiveTo", new Date(effectiveTo).toISOString());

    // içerik
    fd.append("ingredients", JSON.stringify(ingredientsJson || []));
    fd.append("steps", JSON.stringify(stepsJson || []));

    // görseller (backend: images[] dosya, removedImages: string[])
    for (const file of newFiles) fd.append("images", file);
    if (removedExisting.length) {
      const removed = removedExisting
        .map(x => x.publicId || x.url)
        .filter(Boolean) as string[];
      if (removed.length) fd.append("removedImages", JSON.stringify(removed));
    }

    const idAsString = extractId((initial as any)?._id);
    if (isEdit && idAsString) await onSubmit(fd, idAsString);
    else await onSubmit(fd);
  };

  return {
    // i18n
    t, i18n, SUPPORTED_LOCALES,
    // modes
    editMode, setEditMode, aiOpen, setAiOpen,
    // lang
    editLang, setEditLang, isEdit,
    // slug
    slugCanonical, setSlugCanonical, slugMap, setSlugMap, autoSlug, setAutoSlug,
    // TL fields
    title, setTitle, description, setDescription,
    // basic
    order, setOrder, isActive, setIsActive, isPublished, setIsPublished,
    // relations
    categoryIds, setCategoryIds,
    // cuisines & tags
    cuisinesStr, setCuisinesStr, applyCuisineCanon,
    tagsStr, setTagsStr, selectedTags, setSelectedTags, toggleTag, tagSuggestions, tagsRaw, setTagsRaw,
    // numbers
    servings, setServings, prepMinutes, setPrepMinutes, cookMinutes, setCookMinutes,
    totalMinutes, setTotalMinutes, autoTotal, setAutoTotal, calories, setCalories,
    // dates
    effectiveFrom, setEffectiveFrom, effectiveTo, setEffectiveTo,
    // content
    ingredientsJson, setIngredientsJson, stepsJson, setStepsJson,
    // images
    existingUploads, setExistingUploads, removedExisting, setRemovedExisting, newFiles, setNewFiles,
    // computed
    canonicalTitle,
    // json
    recipeJsonValue, applyJsonToState,
    // ai & submit
    applyAiToForm, handleSubmit,
    // helpers (UI’ler için gerekli)
    getTLStrict, setTL, slugifyLite, getTL,
  };
}
