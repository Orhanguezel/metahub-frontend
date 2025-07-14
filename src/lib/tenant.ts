// src/lib/tenant.ts
const DOMAIN_TENANT_MAP: Record<string, string> = {
  "koenigsmassage.com": "anastasia",
  "www.koenigsmassage.com": "anastasia",
  "guezelwebdesign.com": "metahub",
  "www.guezelwebdesign.com": "metahub",
  "ensotek.de": "ensotek",
  "md-hygienelogistik.de": "ensotek",
  // ... diğerleri
};
export function getTenantSlug() {
  // 1. Dev: .env veya localStorage
 if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "localhost") return "metahub";
    if (DOMAIN_TENANT_MAP[host]) return DOMAIN_TENANT_MAP[host];
    // fallback: eski algoritmayı da bırakabilirsin (ama kesin eşleşme önerilir!)
    const parts = host.replace(/^www\./, "").split(".");
    if (parts.length === 2) return parts[0];
    if (parts.length > 2) return parts[parts.length - 2];
    return "metahub";
  }
  return "metahub";
}