// src/lib/tenant.ts
const DOMAIN_TENANT_MAP: Record<string, string> = {
  "koenigsmassage.com": "anastasia",
  "www.koenigsmassage.com": "anastasia",
  "metahub.guezelwebdesign.com": "metahub",
  "www.metahub.guezelwebdesign.com": "metahub",
  "md-hygienelogistik.de": "ensotek",
  "www.md-hygienelogistik.de": "ensotek",
  // ... diğerleri
};

export function detectTenantFromHost(host?: string): string {
  const h = (host || (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  if (h === "localhost") return "metahub"; // Dev default
  if (DOMAIN_TENANT_MAP[h]) return DOMAIN_TENANT_MAP[h];
  const parts = h.replace(/^www\./, "").split(".");
  if (parts.length === 2) return parts[0];
  if (parts.length > 2) return parts[parts.length - 2];
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || "metahub";
}
