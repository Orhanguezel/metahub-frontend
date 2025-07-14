// src/lib/tenant.ts
export function getTenantSlug() {
  // 1. Dev: .env veya localStorage
  if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("tenant");
      if (fromStorage) return fromStorage;
    }
    return (
      process.env.NEXT_PUBLIC_APP_ENV ||
      process.env.NEXT_PUBLIC_TENANT_NAME ||
      process.env.TENANT_NAME ||
      "metahub"
    );
  }

  // 2. Prod: domain/subdomain’den tenant çıkar (ör: ensotek.de → ensotek)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost") return "metahub"; // local override
    // www.ensotek.de veya ensotek.de veya sub.ensotek.de için örnek kural:
    // Domainin ana kısmı slug kabul edilir, subdomain varsa oradan da çıkarılabilir.
    // Aşağıdaki örnekle ensotek.de -> ensotek, www.ensotek.de -> ensotek
    const parts = host.replace(/^www\./, "").split(".");
    if (parts.length === 2) return parts[0]; // ensotek.de
    if (parts.length > 2) return parts[parts.length - 2]; // sub.ensotek.de
    return "metahub"; // fallback
  }
  // SSR’de ya da bilinmeyen durum için fallback
  return "metahub";
}
