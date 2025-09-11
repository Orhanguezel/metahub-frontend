// frontend/src/lib/tenant.ts

/* ──────────────────────────────────────────────────────────────────────────
 * 1) Domain → tenant eşlemesi (PROD & PREVIEW)
 *    Not: www'siz/port'suz normalize sonrası bu haritaya bakılır.
 * ────────────────────────────────────────────────────────────────────────── */
export const DOMAIN_TENANT_MAP: Record<string, string> = {
  "koenigsmassage.com": "anastasia",
  "www.koenigsmassage.com": "anastasia",

  "metahub.guezelwebdesign.com": "gzl",
  "www.metahub.guezelwebdesign.com": "gzl",

  "md-hygienelogistik.de": "hygiene",
  "www.md-hygienelogistik.de": "hygiene",

  "ensotek.de": "ensotek",
  "www.ensotek.de": "ensotek",

  "guezelwebdesign.com": "metahub",
  "www.guezelwebdesign.com": "metahub",

  "test.guezelwebdesign.com": "tarifintarifi",
  "www.test.guezelwebdesign.com": "tarifintarifi",

   "menu.guezelwebdesign.com": "antalya",
  "www.menuguezelwebdesign.com": "antalya",

  // ... diğerleri
};

/* ──────────────────────────────────────────────────────────────────────────
 * 2) Bilinen tenant listesi (asset fallback vb. için)
 *    (Duplicate "antalya" temizlendi)
 * ────────────────────────────────────────────────────────────────────────── */
export type TenantName =
  | "anastasia"
  | "antalya"
  | "ensotek"
  | "gzl"
  | "metahub"
  | "tarifintarifi"
  | "hygiene";

const KNOWN_TENANTS: ReadonlySet<TenantName> = new Set<TenantName>([
  "anastasia",
  "antalya",
  "ensotek",
  "gzl",
  "metahub",
  "tarifintarifi",
  "hygiene",
]);

/* ──────────────────────────────────────────────────────────────────────────
 * 3) Default tenant (DEV fallback)
 * ────────────────────────────────────────────────────────────────────────── */
const DEFAULT_TENANT: TenantName = "metahub";

function getDefaultTenant(): TenantName {
  const envTenant =
    (process.env.NEXT_PUBLIC_TENANT_NAME as TenantName | undefined) ||
    (process.env.NEXT_PUBLIC_APP_ENV as TenantName | undefined) ||
    (process.env.NEXT_PUBLIC_DEFAULT_TENANT as TenantName | undefined);
  if (envTenant && KNOWN_TENANTS.has(envTenant)) return envTenant;
  return DEFAULT_TENANT;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4) Host normalize: port / trailing dot / www / lower-case
 * ────────────────────────────────────────────────────────────────────────── */
function normalizeHost(raw?: string): { host: string; naked: string } {
  const fromWindow =
    typeof window !== "undefined" ? window.location.hostname : "";

  const h = (raw || fromWindow || "")
    .toLowerCase()
    .replace(/:\d+$/, "") // :3000
    .replace(/\.$/, ""); // trailing dot

  const naked = h.replace(/^www\./, "");
  return { host: h, naked };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5) Tenant tespit: mapping → naked mapping → subdomain → 2-level fallback
 *    - DEV: localhost/::1/0.0.0.0 → env/default tenant
 *    - PROD: mapping öncelikli; mapping yoksa güvenli fallback çalışır
 * ────────────────────────────────────────────────────────────────────────── */
export function detectTenantFromHost(host?: string): TenantName | undefined {
  const { host: h, naked } = normalizeHost(host);

  // DEV hostları
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") {
    return getDefaultTenant();
  }

  // 1) Net eşleşme
  const mapped = (DOMAIN_TENANT_MAP[h] ||
    DOMAIN_TENANT_MAP[naked]) as TenantName | undefined;
  if (mapped) return mapped;

  // 2) Güvenli fallback: subdomain'i tenant kabul et (a.b.c → "a")
  const parts = naked.split(".");
  if (parts.length >= 3) return parts[0] as TenantName;

  // 3) İki seviyeli alan adında (örn. ensotek.de) ilk label tenant olsun
  if (parts.length === 2) return parts[0] as TenantName;

  // 4) Bulunamazsa üst katman handle etsin
  return undefined;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6) Favicon yolu: public/favicons/{tenant}.ico → yoksa default
 * ────────────────────────────────────────────────────────────────────────── */
export function getFaviconPathForTenant(tenant?: string): string {
  const t =
    tenant && KNOWN_TENANTS.has(tenant as TenantName)
      ? (tenant as TenantName)
      : DEFAULT_TENANT;
  return `/favicons/${t}.ico`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7) Apex cookie domain: ".guezelwebdesign.com" vb.
 * ────────────────────────────────────────────────────────────────────────── */
export function getApexCookieDomain(host?: string): string {
  const { naked } = normalizeHost(host);
  const parts = naked.split(".");
  if (parts.length >= 2) {
    const apex = `.${parts.slice(-2).join(".")}`;
    return apex; // .guezelwebdesign.com, .md-hygienelogistik.de
  }
  return naked; // localhost vb.
}

/* ──────────────────────────────────────────────────────────────────────────
 * 8) Yardımcılar
 * ────────────────────────────────────────────────────────────────────────── */
export function isKnownTenant(t?: string): t is TenantName {
  return !!t && KNOWN_TENANTS.has(t as TenantName);
}

export function ensureTenantOrDefault(t?: string): TenantName {
  return isKnownTenant(t) ? (t as TenantName) : getDefaultTenant();
}

/* ──────────────────────────────────────────────────────────────────────────
 * 9) Per-tenant meta (Analytics, Theme, vb.)
 *    - Şimdilik sadece Ensotek GTM'i sabitledik.
 *    - İleride .env veya DB'den okunacak şekilde genişletilebilir.
 * ────────────────────────────────────────────────────────────────────────── */
type TenantAnalyticsMeta = {
  gtmId?: string; // Google Tag Manager container id
};

const TENANT_ANALYTICS_META: Record<TenantName, TenantAnalyticsMeta> = {
  anastasia: {},
  antalya: {},
  ensotek: { gtmId: process.env.NEXT_PUBLIC_GTM_ENSOTEK || "GTM-TZRVT3ZB" },
  gzl: {},
  metahub: {},
  tarifintarifi: {},
  hygiene: {},
};

export function getAnalyticsMeta(tenant?: string): TenantAnalyticsMeta {
  const t = ensureTenantOrDefault(tenant);
  return TENANT_ANALYTICS_META[t] || {};
}

/* ──────────────────────────────────────────────────────────────────────────
 * 10) (Opsiyonel) Logo/asset yol yardımcıları eklemek istersen:
 * export function getLogoPathForTenant(tenant?: string) { ... }
 * ────────────────────────────────────────────────────────────────────────── */
