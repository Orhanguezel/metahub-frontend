// frontend/modules/recipes/types.ts

// Çok dilli alanlar ortak tipten
import type { SupportedLocale, TranslatedLabel } from "@/types/recipes/common";

/* ──────────────────────────────────────────────────────────────
   Çok dilli yardımcı tipler (GENEL)
   ────────────────────────────────────────────────────────────── */

export type TL<L extends string = string> = Partial<Record<L, string>>;
export type TranslatedField = TranslatedLabel;

export type UploadImage = {
  url: string;
  thumbnail?: string;
  webp?: string;
  publicId?: string;
};

/* ──────────────────────────────────────────────────────────────
   Recipe tipleri
   ────────────────────────────────────────────────────────────── */

export interface IRecipeImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
  _id?: string;
}

export interface IRecipeIngredient {
  name: TranslatedField;
  amount?: TranslatedField;
  order?: number;
}

export interface IRecipeStep {
  order: number;
  text: TranslatedField;
}

export type RecipeCategoryRef =
  | string
  | { _id: string; name?: TranslatedField; slug?: string };

export interface IRecipe {
  _id: string;
  tenant: string;

  slugCanonical: string;
  slug: TranslatedField;

  order?: number;

  title: TranslatedField;
  description?: TranslatedField;

  images: IRecipeImage[];

  cuisines?: string[];
  tags?: TranslatedField[];

  categories?: RecipeCategoryRef[];

  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  calories?: number;

  ingredients: IRecipeIngredient[];
  steps: IRecipeStep[];

  effectiveFrom?: string; // ISO
  effectiveTo?: string;   // ISO

  isPublished: boolean;
  isActive: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Public listeleme filtreleri */
export type RecipeListQuery = {
  q?: string;
  tag?: string;
  maxTime?: number;
  limit?: number;
};

/** Admin listeleme filtreleri */
export type RecipeAdminListQuery = {
  q?: string;
  isActive?: boolean;
  isPublished?: boolean;
  category?: string;
  limit?: number;
};

/** Admin create/update form giriş tipi (UI form’dan topladığın veri) */
export type RecipeFormInput = {
  // multipart ile gönderilecek alanlar
  slugCanonical?: string;            // ✅ eklendi
  slug?: string | TranslatedField;
  order?: number;

  title?: TranslatedField;
  description?: TranslatedField;

  cuisines?: string[];

  // Hem string[] (anahtarlar) hem de çok dilli etiket nesneleri gelebilsin
  tags?: (TranslatedField | string)[];   // ✅ esnetildi

  categories?: string[]; // only ids

  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  calories?: number;

  // opsiyonel yayın aralığı
  effectiveFrom?: string | null;     // ✅ eklendi
  effectiveTo?: string | null;       // ✅ eklendi

  ingredients?: IRecipeIngredient[];
  steps?: IRecipeStep[];

  isPublished?: boolean;
  isActive?: boolean;

  // görseller: yeni upload’lar ve silinecekler
  images?: File[];
  removedImages?: string[];
};
export interface RecipeCategory {
  _id: string;
  tenant: string;
  name: TranslatedField;
  slug: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

/** Public liste sorgusu */
export type RecipeCategoryListQuery = {
  q?: string;
  isActive?: boolean | string;
  limit?: number;
};

/** Create/Update payload (JSON) */
export type RecipeCategoryUpsertInput = {
  name: TranslatedField;
  slug?: string | TranslatedField;
  order?: number;
  isActive?: boolean;
};

/* ──────────────────────────────────────────────────────────────
   AI Generator tipleri
   ────────────────────────────────────────────────────────────── */

export type AiGenInput<L extends string = SupportedLocale> = {
  lang: L;
  cuisine?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  servings?: number;
  maxMinutes?: number;
  includeIngredients?: string[];
  excludeIngredients?: string[];
  prompt?: string;
};

export type AiResponse = {
  success: boolean;
  data?: any;
  message?: string;
};

export type AIGeneratorProps<L extends string = SupportedLocale> = {
  endpoint?: string;
  defaultLang?: L;
  compact?: boolean;
  onGenerated: (ai: any, mode: "replace" | "merge") => void;
};

export type RecipeAIGeneratePayload = AiGenInput<SupportedLocale>;

/* ──────────────────────────────────────────────────────────────
   UI yardımcı: form input → FormData
   ────────────────────────────────────────────────────────────── */

export function buildRecipeFormData(data: RecipeFormInput): FormData {
  const fd = new FormData();
  const put = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    if (typeof File !== "undefined" && v instanceof File) { fd.append(k, v); return; }
    if (typeof Blob !== "undefined" && v instanceof Blob) { fd.append(k, v); return; }
    if (typeof v === "object") { fd.append(k, JSON.stringify(v)); return; }
    fd.append(k, String(v));
  };

  put("slugCanonical", data.slugCanonical);   // ✅
  put("slug", data.slug);
  put("order", data.order);

  put("title", data.title);
  put("description", data.description);

  put("cuisines", data.cuisines);
  put("tags", data.tags);

  put("categories", data.categories);

  put("servings", data.servings);
  put("prepMinutes", data.prepMinutes);
  put("cookMinutes", data.cookMinutes);
  put("totalMinutes", data.totalMinutes);
  put("calories", data.calories);

  put("effectiveFrom", data.effectiveFrom);   // ✅
  put("effectiveTo", data.effectiveTo);       // ✅

  put("ingredients", data.ingredients);
  put("steps", data.steps);

  put("isPublished", data.isPublished);
  put("isActive", data.isActive);

  if (Array.isArray(data.images)) for (const f of data.images) if (f) fd.append("images", f);
  put("removedImages", data.removedImages || []);

  return fd;
}
