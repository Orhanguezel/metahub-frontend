// src/lib/tenant.ts

// 1️⃣ Domain → tenant eşlemesi
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
  "menu.guezelwebdesign.com": "antalya",
  "www.menu.guezelwebdesign.com": "antalya",
  "www.test.guezelwebdesign.com": "tarifintarifi",
  "www.tarifintarifi.com": "tarifintarifi",
  "tarifintarifi.com": "tarifintarifi",
  // ... diğerleri
};

// Bu projede public/favicons içinde gerçekten var olan .ico'lar
const KNOWN_TENANTS = new Set([
  "anastasia",
  "antalya",
  "ensotek",
  "gzl",
  "metahub",
  "antalya",
  "tarifintarifi",
]);

// Default tenant (fallback)
const DEFAULT_TENANT = "metahub";

// 2️⃣ Local ortamda tenant fallback (geliştirici için)
function getDefaultTenant(): string {
  return (
    process.env.NEXT_PUBLIC_TENANT_NAME ||
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    DEFAULT_TENANT
  );
}

/** Host normalize: port/trailing dot/WWW temizle, lowercase */
function normalizeHost(raw?: string): { host: string; naked: string } {
  const h =
    (raw || (typeof window !== "undefined" ? window.location.hostname : "") || "")
      .toLowerCase()
      .replace(/:\d+$/, "")   // :3000
      .replace(/\.$/, "");    // trailing dot

  const naked = h.replace(/^www\./, "");
  return { host: h, naked };
}

/**
 * 3️⃣ Host'tan tenant tespiti
 * - Önce TAM eşleşme (mapping) + naked eşleşme
 * - Kaçarsa güvenli fallback: subdomain'i tenant say
 *   ör: metahub.guezelwebdesign.com -> "metahub"
 */
export function detectTenantFromHost(host?: string): string | undefined {
  const { host: h, naked } = normalizeHost(host);

  // LOCALHOST için fallback tenant
  if (h === "localhost" || h === "127.0.0.1") {
    return getDefaultTenant();
  }

  // 1) Map’ten doğrudan eşleşme
  if (DOMAIN_TENANT_MAP[h]) return DOMAIN_TENANT_MAP[h];
  if (DOMAIN_TENANT_MAP[naked]) return DOMAIN_TENANT_MAP[naked];

  // 2) Güvenli fallback: subdomain’i tenant kabul et
  //    "metahub.guezelwebdesign.com" -> ["metahub","guezelwebdesign","com"]
  const parts = naked.split(".");
  if (parts.length >= 3) return parts[0]; // ilk label
  if (parts.length === 2) return parts[0]; // ensotek.de -> "ensotek"

  // PROD'da üst katman handle etsin
  return undefined;
}

/**
 * 4️⃣ Tenant'a göre favicon dosya path'i
 * public/favicons/{tenant}.ico içinde varsa döner,
 * yoksa güvenli şekilde default'a (metahub.ico) düşer
 */
export function getFaviconPathForTenant(tenant?: string): string {
  const t = tenant && KNOWN_TENANTS.has(tenant) ? tenant : DEFAULT_TENANT;
  return `/favicons/${t}.ico`;
}

/**
 * 5️⃣ (Opsiyonel) Cookie domain yardımcı:
 *    ".guezelwebdesign.com" döndürür; tek label ise host’u aynen döndürür.
 *    Auth cookie’lerini subdomain’ler arası paylaşacaksanız işinize yarar.
 */
export function getApexCookieDomain(host?: string): string {
  const { naked } = normalizeHost(host);
  const parts = naked.split(".");
  if (parts.length >= 2) {
    const apex = `.${parts.slice(-2).join(".")}`;
    return apex; // .guezelwebdesign.com, .md-hygienelogistik.de
  }
  return naked; // localhost gibi
}

// 6️⃣ (İsterseniz) başka asset yolları için de benzeri yardımcılar yazabilirsiniz.
// export function getLogoPathForTenant(tenant?: string) { ... }
