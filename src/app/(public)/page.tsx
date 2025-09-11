import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import HomePage from "@/modules/home/public/pages/HomePage";
import SeoFromStore from "@/modules/seo/SeoFromStore";
import { detectTenantFromHost } from "@/lib/tenant";
import { fetchSeoSlicesServer, buildServerSeoMetadata } from "@/lib/serverSeo";

export const dynamic = "force-dynamic";

const DEFAULT_LOCALE: SupportedLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "de";

const isSupported = (x?: string): x is SupportedLocale =>
  !!x && (SUPPORTED_LOCALES as readonly string[]).includes(x as any);

function pickFromAcceptLanguage(al: string | null): SupportedLocale | null {
  if (!al) return null;
  const items = al
    .split(",")
    .map((s) => {
      const [tag, qPart] = s.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      const primary = tag.split("-")[0]?.toLowerCase() || "";
      return { primary, q };
    })
    .filter(Boolean)
    .sort((a, b) => b.q - a.q);
  for (const { primary } of items) if (isSupported(primary)) return primary;
  return null;
}

// küçük yardımcı
const clip = (s?: string, n = 160) =>
  s ? (s.length > n ? s.slice(0, n - 1) + "…" : s) : undefined;

// ✅ SSR Metadata
export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const tenant = detectTenantFromHost(hostHeader) || "default";

  // ✅ LOCALE: önce 'locale', yoksa 'NEXT_LOCALE', sonra Accept-Language, en sonda default
  const cookieLocaleRaw =
    cookieStore.get("locale")?.value ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "";
  const cookieLocale = cookieLocaleRaw.toLowerCase();
  const acceptLang = hdrs.get("accept-language");

  const locale: SupportedLocale =
    (isSupported(cookieLocale) && cookieLocale) ||
    pickFromAcceptLanguage(acceptLang) ||
    DEFAULT_LOCALE;

  // 1) SSR: veriyi çek ve metadata’yı build et
  try {
    const { company, settings, tenantModules } = await fetchSeoSlicesServer(tenant, locale);
    if (company || settings || tenantModules) {
      const ssr = buildServerSeoMetadata({
        page: "home",
        locale,
        host: hostHeader,
        company,
        settings,
        tenantModules,
      });
      return {
        ...ssr,
        robots: { index: true, follow: true },
      } satisfies Metadata;
    }
  } catch {
    // yut ve cookie fallback’e düş
  }

  // 2) Fallback: locale’li cookie snapshot
  const keyWithLocale = `seo_snap_${tenant}_home_${locale}`;
  const keyOld = `seo_snap_${tenant}_home`;
  const snapCookie =
    cookieStore.get(keyWithLocale)?.value ||
    cookieStore.get(keyOld)?.value ||
    null;

  let snap: { title?: string; description?: string; og?: string } | null = null;
  try {
    if (snapCookie) snap = JSON.parse(decodeURIComponent(snapCookie));
  } catch {
    snap = null;
  }

  const hostName = hostHeader.replace(/^www\./, "");
  const fallbackTitle = snap?.title || hostName;
  const fallbackDescription =
    clip(snap?.description) || clip(`${hostName} — çoklu tenant SaaS platformu.`);

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    openGraph: {
      title: fallbackTitle,
      description: fallbackDescription,
      images: snap?.og ? [snap.og] : undefined,
    } as any,
    twitter: {
      card: "summary_large_image",
      title: fallbackTitle,
      description: fallbackDescription,
      images: snap?.og ? [snap.og] : undefined,
    } as any,
    robots: { index: true, follow: true },
  };
}

// ✅ Sayfa component (CSR head zenginleştirme)
export default async function HomeRoutePage() {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const cookieLocaleRaw =
    cookieStore.get("locale")?.value ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "";
  const cookieLocale = cookieLocaleRaw.toLowerCase();

  const acceptLang = hdrs.get("accept-language");
  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";

  const locale: SupportedLocale =
    (isSupported(cookieLocale) && cookieLocale) ||
    pickFromAcceptLanguage(acceptLang) ||
    DEFAULT_LOCALE;

  return (
    <>
      {/* Hydration sonrası client, <head>’i zenginleştirir/günceller */}
      <SeoFromStore page="home" locale={locale} host={hostHeader} />
      <HomePage />
    </>
  );
}
