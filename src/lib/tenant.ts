// src/lib/tenant.ts

const DOMAIN_TENANT_MAP: Record<string, string> = {
  "koenigsmassage.com": "anastasia",
  "www.koenigsmassage.com": "anastasia",
  "metahub.guezelwebdesign.com": "metahub",
  "www.metahub.guezelwebdesign.com": "metahub",
  "md-hygienelogistik.de": "hygiene",
  "www.md-hygienelogistik.de": "hygiene",
  "ensotek.de": "ensotek",
  "www.ensotek.de": "ensotek",
  "guezelwebdesign.com": "metahub",
  "www.guezelwebdesign.com": "metahub",
  // ... diğerleri
};

function getDefaultTenant(): string {
  // Sadece localde kullanılacak!
  return (
    process.env.NEXT_PUBLIC_TENANT_NAME ||
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "metahub"
  );
}

export function detectTenantFromHost(host?: string): string | undefined {
  const h =
    (host || (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();

  // --- LOCALHOST ---
  if (h === "localhost" || h === "127.0.0.1") {
    return getDefaultTenant();
  }

  // --- PROD ORTAMI ---
  // 1. Haritadan direkt eşleşme
  if (DOMAIN_TENANT_MAP[h]) return DOMAIN_TENANT_MAP[h];

  // 2. Alt domain ise kökü kullan (örn: abc.ensotek.com → ensotek)
  const parts = h.replace(/^www\./, "").split(".");
  if (parts.length === 2) return parts[0];
  if (parts.length > 2) return parts[parts.length - 2];

  // --- PROD'DA FALLBACK ASLA OLMAYACAK ---
  // Burada undefined döner ve üst katmanda kontrol edilir (ör: hata mesajı/log).
  return undefined;
}
