import { buildSeoFromSlices } from "@/lib/seoMeta";
import type { Metadata } from "next";

/** Sunucu tarafı JSON fetch (x-tenant + accept-language) */
async function fetchJson<T>(
  url: string,
  { tenant, locale }: { tenant: string; locale: string }
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "x-tenant": tenant,
        "accept-language": locale,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "";

// Varsayılan public uçlar
const ENDPOINTS = {
  company: [
    `${API_BASE}/api/public/company`,
    `${API_BASE}/api/company/public`,
    `${API_BASE}/api/company`,
  ],
  settings: [
    `${API_BASE}/api/public/settings`,
    `${API_BASE}/api/settings/public`,
    `${API_BASE}/api/settings`,
  ],
  tenantModules: [
    `${API_BASE}/api/public/tenant-modules`,
    `${API_BASE}/api/tenantmodules/public`,
    `${API_BASE}/api/tenantmodules`,
  ],
};

// 🔹 Yardımcı
async function tryMany<T>(urls: string[], tenant: string, locale: string) {
  for (const u of urls.filter(Boolean)) {
    const data = await fetchJson<T>(u, { tenant, locale });
    if (data) return data;
  }
  return null;
}

/** Slice'ları çek (SSR) */
export async function fetchSeoSlicesServer(tenant: string, locale: string) {
  const [company, settings, tenantModules] = await Promise.all([
    tryMany<any>(ENDPOINTS.company, tenant, locale),
    tryMany<any>(ENDPOINTS.settings, tenant, locale),
    tryMany<any>(ENDPOINTS.tenantModules, tenant, locale),
  ]);
  return { company, settings, tenantModules };
}

/** About içeriğini slug ile çek (SSR) */
export async function fetchAboutBySlugServer(
  tenant: string,
  slug: string,
  locale: string
) {
  const candidates = [
    `${API_BASE}/api/public/about/slug/${encodeURIComponent(slug)}`,
    `${API_BASE}/api/public/about/${encodeURIComponent(slug)}`,
    `${API_BASE}/api/about/public/${encodeURIComponent(slug)}`,
    `${API_BASE}/api/about/${encodeURIComponent(slug)}`,
  ].filter(Boolean);

  for (const url of candidates) {
    const data = await fetchJson<any>(url, { tenant, locale });
    if (data) return data;
  }
  return null;
}

/** buildSeoFromSlices → Next Metadata */
export function buildServerSeoMetadata({
  page,
  locale,
  host,
  company,
  settings,
  tenantModules,
  content,
}: {
  page: string;
  locale: string;
  host?: string;
  company?: any;
  settings?: any;
  tenantModules?: any;
  content?: any;
}): Metadata {
  const meta = buildSeoFromSlices({
    page,
    locale,
    host,
    company: company ?? null,
    settings: settings ?? null,
    tenantModules: tenantModules ?? null,
    content: content ?? null,
  });

  const title = typeof meta.title === "string" ? meta.title : undefined;
  const description = typeof meta.description === "string" ? meta.description : undefined;

  const og: any = meta.openGraph || {};
  const tw: any = meta.twitter || {};
  const images = Array.isArray(og.images) ? og.images : undefined;

  return {
    title,
    description,
    openGraph: {
      title: og.title || title,
      description: og.description || description,
      images,
      type: "website",
      siteName: og.siteName || title,
    } as any,
    twitter: {
      card: "summary_large_image",
      title: (tw as any).title || title,
      description: (tw as any).description || description,
      images: (tw as any).images || images,
    } as any,
  } satisfies Metadata;
}
