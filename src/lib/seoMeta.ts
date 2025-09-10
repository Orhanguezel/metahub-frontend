import type { Metadata } from "next";
import { type SupportedLocale } from "@/types/common";

/** ===== Tipler (gevşek) ===== */
export type Localized =
  | string
  | Partial<Record<SupportedLocale | string, string>>
  | undefined
  | null;

export type CompanyDTO = {
  tenant?: string;
  companyName?: Localized;
  companyDesc?: Localized;
  website?: string;
  images?: Array<{ url?: string; webp?: string; thumbnail?: string }>;
};

export type SettingItem = {
  key: string;
  value?: any;
  isActive?: boolean;
  images?: any[];
};

export type ModuleSeo = {
  module?: string;                 // "home", "about"...
  seoTitle?: Localized;
  seoDescription?: Localized;
  seoSummary?: Localized;
  seoOgImage?: string;
  enabled?: boolean;
};

export type BuildSeoInput = {
  page: string;                    // "home" | "about" | ...
  locale: string;                  // "tr", "en", ...
  host?: string;                   // window.location.host / SSR host
  company?: CompanyDTO | null;
  settings?: SettingItem[] | null;
  tenantModules?: ModuleSeo[] | null;
  /** slice’tan gelen tekil içerik (about item, blog post, ürün, vs.) */
  content?: any | null;
};

/** ===== Yardımcılar ===== */
const nonEmpty = (s?: string | null) => (s && s.trim() ? s.trim() : undefined);

const FALLBACK_LOCALES: string[] = Array.from(
  new Set([
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
    "tr",
    "en",
    "de",
  ])
);

export function pickLocalized(
  v: Localized,
  locale: string,
  fallbacks: string[] = FALLBACK_LOCALES
): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return nonEmpty(v);
  const order = [locale, ...fallbacks].filter(Boolean);
  for (const key of order) {
    const val = (v as any)[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  for (const val of Object.values(v)) {
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return undefined;
}

function get(obj: any, path: string): any {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function first<T>(...vals: Array<T | undefined>): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v as T;
  return undefined;
}

function toImageUrl(img: any): string | undefined {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.url || img.webp || img.thumbnail || img.src || img.href || undefined;
}

/** Settings içinde localized string arama */
function findLocalizedInSettings(
  settings: SettingItem[] | null | undefined,
  locale: string,
  keys: string[]
): string | undefined {
  if (!Array.isArray(settings)) return undefined;

  const candidates: Array<{ key: string; paths: string[] }> = [
    { key: "seo_default_title", paths: ["value.label", "value.title.label"] },
    { key: "default_seo_title", paths: ["value.label", "value.title.label"] },
    { key: "site_title", paths: ["value.label", "value.title.label"] },
    { key: "brand_title", paths: ["value.label", "value.title.label"] },
    { key: "site_name", paths: ["value.label", "value.title.label"] },
    { key: "navbar_logo_text", paths: ["value.title.label", "value.slogan.label"] },
  ];

  const priority = keys.length ? settings.filter((s) => keys.includes(s.key)) : settings;

  for (const s of priority) {
    const found =
      pickLocalized(get(s, "value.title.label"), locale) ||
      pickLocalized(get(s, "value.slogan.label"), locale) ||
      pickLocalized(get(s, "value.label"), locale);
    if (found) return found;
  }

  for (const { key, paths } of candidates) {
    const s = settings.find((x) => x.key === key);
    if (!s) continue;
    for (const p of paths) {
      const v = get(s, p);
      const found = pickLocalized(v, locale);
      if (found) return found;
    }
  }

  // Son çare
  for (const s of settings) {
    const v =
      get(s, "value.title.label") ||
      get(s, "value.slogan.label") ||
      get(s, "value.label");
    const found = pickLocalized(v, locale);
    if (found) return found;
  }
  return undefined;
}

function findDescriptionInSettings(
  settings: SettingItem[] | null | undefined,
  locale: string
): string | undefined {
  if (!Array.isArray(settings)) return undefined;

  const keys = [
    "seo_default_description",
    "default_seo_description",
    "site_description",
    "brand_description",
    "company_description",
  ];

  for (const k of keys) {
    const s = settings.find((x) => x.key === k);
    if (!s) continue;
    const found =
      pickLocalized(get(s, "value.description.label"), locale) ||
      pickLocalized(get(s, "value.label"), locale) ||
      pickLocalized(get(s, "value.text.label"), locale);
    if (found) return found;
  }

  return findLocalizedInSettings(settings, locale, []);
}

/** Module SEO bul */
function findModuleSeo(
  tenantModules: ModuleSeo[] | null | undefined,
  page: string
) {
  if (!Array.isArray(tenantModules)) return undefined;
  return tenantModules.find((m: any) => m?.module === page || m?.key === page);
}

/** -------- İçerikten SEO çıkarıcı (about/blog/product vb.) -------- */
function extractContentSeo(item: any, locale: string): {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
} {
  if (!item || typeof item !== "object") return {};

  // Başlık adayları (id, _id gibi alanları bilerek KULLANMIYORUZ)
  const title =
    nonEmpty(pickLocalized(item.seoTitle, locale)) ||
    nonEmpty(pickLocalized(item.title, locale)) ||
    nonEmpty(pickLocalized(item.name, locale)) ||
    nonEmpty(pickLocalized(item.companyName, locale));

  // Açıklama adayları
  const description =
    nonEmpty(pickLocalized(item.seoDescription, locale)) ||
    nonEmpty(pickLocalized(item.summary, locale)) ||
    nonEmpty(pickLocalized(item.description, locale)) ||
    nonEmpty(pickLocalized(item.companyDesc, locale));

  // Görsel adayları
  const image =
    toImageUrl(item.ogImage) ||
    toImageUrl(item.seoOgImage) ||
    toImageUrl(item.coverImage) ||
    toImageUrl(item.image) ||
    toImageUrl(item.thumbnail) ||
    toImageUrl(item.images?.[0]);

  // Etiket/keywords
  let keywords: string | undefined;
  const rawTags =
    item.tags ||
    item.keywords ||
    get(item, "seo.tags") ||
    get(item, "seo.keywords");
  if (Array.isArray(rawTags)) {
    const flat = rawTags
      .map((t) =>
        typeof t === "string"
          ? t
          : pickLocalized(t as Localized, locale) || ""
      )
      .map((s) => s.trim())
      .filter(Boolean);
    if (flat.length) keywords = flat.join(", ");
  } else if (typeof rawTags === "string") {
    keywords = rawTags;
  }

  return { title, description, image, keywords };
}

/** ===== ANA PURE FONKSİYON ===== */
export function buildSeoFromSlices({
  page,
  locale,
  host,
  company,
  settings,
  tenantModules,
  content,
}: BuildSeoInput): Metadata {
  // 0) İçerik (varsa ÖNCE içerik)
  const c = extractContentSeo(content, locale);

  // 1) Modül SEO
  const mod = findModuleSeo(tenantModules, page);
  const titleFromModule =
    nonEmpty(pickLocalized((mod as any)?.title, locale)) ||
    nonEmpty(pickLocalized(mod?.seoTitle, locale));
  const descFromModule =
    nonEmpty(pickLocalized((mod as any)?.description, locale)) ||
    nonEmpty(pickLocalized(mod?.seoDescription, locale)) ||
    nonEmpty(pickLocalized((mod as any)?.summary, locale)) ||
    nonEmpty(pickLocalized(mod?.seoSummary, locale));
  const ogFromModule = nonEmpty((mod as any)?.ogImage || mod?.seoOgImage);

  // 2) Settings
  const titleFromSettings =
    findLocalizedInSettings(settings, locale, [
      "seo_default_title",
      "default_seo_title",
      "site_title",
      "brand_title",
      "site_name",
      "navbar_logo_text",
    ]);
  const descFromSettings = findDescriptionInSettings(settings, locale);

  // 3) Company
  const titleFromCompany = nonEmpty(pickLocalized(company?.companyName, locale));
  const descFromCompany = nonEmpty(pickLocalized(company?.companyDesc, locale));
  const ogFromCompany =
    nonEmpty(company?.images?.[0]?.webp) ||
    nonEmpty(company?.images?.[0]?.url) ||
    nonEmpty(company?.images?.[0]?.thumbnail);

  // 4) Host/ENV fallback (hard-code yok)
  const titleFallback =
    nonEmpty(process.env.NEXT_PUBLIC_TENANT_NAME) ||
    nonEmpty(host?.replace(/^www\./, "")) ||
    " ";

  // Compose (İÇERİK > module > settings > company > host)
  const title =
    c.title ||
    titleFromModule ||
    titleFromSettings ||
    titleFromCompany ||
    titleFallback;

  const description =
    c.description ||
    descFromModule ||
    descFromSettings ||
    descFromCompany ||
    undefined;

  const ogImage = first(c.image, ogFromModule, ogFromCompany);
  const images = ogImage ? [ogImage] : [];

  const siteName = titleFromSettings || titleFromCompany || titleFallback;

  // keywords (varsa)
  const keywords = c.keywords || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images,
      // Next Metadata union sıkı → tüketici any ile okuyacak
      type: "website",
      siteName,
    } as any,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    } as any,
  };
}
