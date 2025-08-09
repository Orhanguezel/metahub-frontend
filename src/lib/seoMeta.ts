// src/lib/seoMeta.ts

import { detectTenantFromHost } from "@/lib/tenant";
import apiCall from "@/lib/apiCall"; // veya "@/api/apiCall" — kendi yoluna göre düzelt

export async function generatePageMetadata({
  page,
  params,
  searchParams,
  extraMeta = {},
  host, // SSR ortamında host header'ı parametre olarak geçilebilir
}: {
  page: string;
  params?: any;
  searchParams?: Record<string, any>;
  extraMeta?: Record<string, any>;
  host?: string;
}) {
  // Tenant tespiti
  const tenant = detectTenantFromHost(host);

  // Locale
  const locale = searchParams?.locale || "en";

  // API'den meta çek — apiCall ile (header, tenant, language vs. otomatik)
  // Parametreleri query-string olarak gönder (tenant da ekle!)
  const meta = await apiCall(
    "get",
    "/api/seo-meta",
    { tenant, locale, page }
  );

  // Fallback mantığı
  const description =
    meta?.description ||
    meta?.summary ||
    "Kurumsal SaaS altyapısı, MetaHub ile tüm içeriklerinizi yönetin.";

  const ogImages = meta?.ogImage ? [meta.ogImage] : [];

  return {
    title: meta?.title || `MetaHub | ${page}`,
    description,
    openGraph: {
      title: meta?.title || `MetaHub | ${page}`,
      description,
      images: ogImages,
    },
    ...extraMeta,
  };
}
