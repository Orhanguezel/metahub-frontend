// src/lib/tenant.ts

// 1️⃣ Tenant mapping tablon
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
  "test.guezelwebdesign.com": "antalya",
  "www.test.guezelwebdesign.com": "antalya",
  // ... diğerleri
};

// 2️⃣ Local ortamda tenant fallback (geliştirici için)
function getDefaultTenant(): string {
  return (
    process.env.NEXT_PUBLIC_TENANT_NAME ||
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "metahub"
  );
}

// 3️⃣ Host'tan tenant tespiti (port temizliği eklendi)
export function detectTenantFromHost(host?: string): string | undefined {
  let h =
    (host || (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();

  // PORTU TEMİZLE!
  h = h.replace(/:\d+$/, "");

  // LOCALHOST için fallback tenant
  if (h === "localhost" || h === "127.0.0.1") {
    return getDefaultTenant();
  }

  // Map'ten doğrudan eşleşme
  if (DOMAIN_TENANT_MAP[h]) return DOMAIN_TENANT_MAP[h];

  // Alt domain ise kökü kullan
  const parts = h.replace(/^www\./, "").split(".");
  if (parts.length === 2) return parts[0];
  if (parts.length > 2) return parts[parts.length - 2];

  // PROD'DA fallback asla olmayacak (undefined dön, üstte handle et)
  return undefined;
}

// 4️⃣ Tenant'a göre favicon dosya path'i (public/favicons/{tenant}.ico)
export function getFaviconPathForTenant(tenant?: string): string {
  // tenant yoksa veya bilinmeyense fallback favicon (public/favicon.ico)
  if (!tenant) return "/favicon.ico";
  return `/favicons/${tenant}.ico`;
}

// 5️⃣ (İstersen) Tenant'a göre başka static asset, logo, css vs. için de aynı yapı kullanılabilir
// export function getLogoPathForTenant(tenant?: string) { ... }
