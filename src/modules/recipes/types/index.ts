// Çok dilli alanları projedeki ortak tipten alıyoruz
import type { SupportedLocale } from "@/types/common";

/* ──────────────────────────────────────────────────────────────
   Çok dilli yardımcı tipler (GENEL)
   ────────────────────────────────────────────────────────────── */

// Generic çok dilli alan
export type TL<L extends string = string> = Partial<Record<L, string>>;

// Proje genelinde kullanılan isim
export type TranslatedField = TL<SupportedLocale>;

// Upload image (UI tarafı için esnek)
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
  order?: number; // 0..100000
}

export interface IRecipeStep {
  order: number; // 1..100000
  text: TranslatedField;
}

export type RecipeCategoryRef =
  | string
  | {
      _id: string;
      name?: TranslatedField;
      slug?: string;
    };

export interface IRecipe {
  _id: string;
  tenant: string;

  // Canonical & çok dilli slug
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
  effectiveTo?: string; // ISO

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
  limit?: number; // varsayılan 20
};

/** Admin listeleme filtreleri */
export type RecipeAdminListQuery = {
  q?: string;
  isActive?: boolean;
  isPublished?: boolean;
  category?: string; // category ObjectId
  limit?: number; // varsayılan 20..200
};

/** Admin create/update form giriş tipi (UI form’dan topladığın veri) */
export type RecipeFormInput = {
  // multipart ile gönderilecek alanlar
  slug?: string;
  order?: number;

  title?: TranslatedField;
  description?: TranslatedField;

  cuisines?: string[];
  tags?: TranslatedField[];

  categories?: string[]; // only ids

  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  calories?: number;

  ingredients?: IRecipeIngredient[];
  steps?: IRecipeStep[];

  isPublished?: boolean;
  isActive?: boolean;

  // görseller: yeni upload’lar ve silinecekler
  images?: File[]; // yeni eklenecek dosyalar
  removedImages?: string[]; // publicId veya url bazlı (BE’nin beklediğine göre)
};

export interface RecipeCategory {
  _id: string;
  tenant: string;
  name: TranslatedField; // en az bir dil dolu
  slug: string;
  isActive: boolean;
  order?: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Public liste sorgusu */
export type RecipeCategoryListQuery = {
  q?: string;
  isActive?: boolean | string; // BE true/false string kabul ediyorsa
  limit?: number; // varsayılan 20..50
};

/** Create/Update payload (JSON) */
export type RecipeCategoryUpsertInput = {
  name: TranslatedField;
  slug?: string;
  order?: number;
  isActive?: boolean;
};

/* ──────────────────────────────────────────────────────────────
   AI Generator tipleri (Admin + Public reusable)
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
  data?: any; // BE'nin ürettiği tarif objesi (örnekteki yapı)
  message?: string;
};

export type AIGeneratorProps<L extends string = SupportedLocale> = {
  endpoint?: string; // default: /api/recipes/ai/generate
  defaultLang?: L;
  compact?: boolean;
  onGenerated: (ai: any, mode: "replace" | "merge") => void;
};

// (İstersen) Postman/BE için alias
export type RecipeAIGeneratePayload = AiGenInput<SupportedLocale>;

/* ──────────────────────────────────────────────────────────────
   UI yardımcı: form input → FormData
   ────────────────────────────────────────────────────────────── */

export function buildRecipeFormData(data: RecipeFormInput): FormData {
  const fd = new FormData();

  const put = (k: string, v: any) => {
    if (v === undefined || v === null) return;
    if (v instanceof Blob) fd.append(k, v);
    else if (typeof v === "object") fd.append(k, JSON.stringify(v));
    else fd.append(k, String(v));
  };

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

  put("ingredients", data.ingredients);
  put("steps", data.steps);

  put("isPublished", data.isPublished);
  put("isActive", data.isActive);

  // images (çoklu dosya)
  if (Array.isArray(data.images)) {
    for (const file of data.images) {
      if (file) fd.append("images", file);
    }
  }

  put("removedImages", data.removedImages || []);

  return fd;
}
