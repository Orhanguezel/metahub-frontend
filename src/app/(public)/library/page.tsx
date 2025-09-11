import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { detectTenantFromHost } from "@/lib/tenant";
import { pickFromAcceptLanguage } from "@/lib/locale";
import SeoFromStore from "@/modules/seo/SeoFromStore";
import LibraryPage from "@/modules/library/public/pages/Page";

export const dynamic = "force-dynamic";

const DEFAULT_LOCALE: SupportedLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "de";

/* ---------- SSR METADATA (client snapshot fallback) ---------- */
export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const tenant = detectTenantFromHost(hostHeader) || "default";

  // locale: cookie(locale|NEXT_LOCALE) → Accept-Language → default
  const cookieLocaleRaw =
    cookieStore.get("locale")?.value ??
    cookieStore.get("NEXT_LOCALE")?.value ??
    "";
  const cookieLocale2 = cookieLocaleRaw.slice(0, 2).toLowerCase() as SupportedLocale;
  const acceptLang = hdrs.get("accept-language");

  const locale: SupportedLocale =
    (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(cookieLocale2)
      ? cookieLocale2
      : pickFromAcceptLanguage(acceptLang) || DEFAULT_LOCALE;

  // Client <SeoFromStore> şu anahtar ile snapshot yazar:
  // seo_snap_${tenant}_library_${locale}
  const snapKey = `seo_snap_${tenant}_library_${locale}`;
  const snapLegacy = `seo_snap_${tenant}_library_library_${locale}`; // bir süreliğine legacy
  const snapOldKey = `seo_snap_${tenant}_library`;

  const snapRaw =
    cookieStore.get(snapKey)?.value ??
    cookieStore.get(snapLegacy)?.value ??
    cookieStore.get(snapOldKey)?.value ??
    null;

  let snap: { title?: string; description?: string; og?: string } | null = null;
  try {
    if (snapRaw) snap = JSON.parse(decodeURIComponent(snapRaw));
  } catch {}

  const fallbackTitle = snap?.title || hostHeader.replace(/^www\./, "");
  const fallbackDescription = snap?.description || "";

  return {
    title: fallbackTitle,
    description: fallbackDescription || undefined,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription || undefined,
      images: snap?.og ? [snap.og] : undefined,
      type: "website",
    } as any,
    twitter: {
      card: "summary_large_image",
      title: fallbackTitle,
      description: fallbackDescription || undefined,
      images: snap?.og ? [snap.og] : undefined,
    } as any,
    robots: { index: true, follow: true },
  };
}

/* ---------- PAGE (RSC) ---------- */
export default async function LibraryRoutePage() {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const cookieLocaleRaw =
    cookieStore.get("locale")?.value ??
    cookieStore.get("NEXT_LOCALE")?.value ??
    "";
  const cookieLocale2 = cookieLocaleRaw.slice(0, 2).toLowerCase() as SupportedLocale;
  const acceptLang = hdrs.get("accept-language");
  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";

  const locale: SupportedLocale =
    (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(cookieLocale2)
      ? cookieLocale2
      : pickFromAcceptLanguage(acceptLang) || DEFAULT_LOCALE;

  return (
    <>
      {/* Tek yerde SEO */}
      <SeoFromStore page="library" locale={locale} host={hostHeader} />
      <LibraryPage />
    </>
  );
}
