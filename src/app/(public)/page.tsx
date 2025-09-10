// Server Component (burada "use client" OLMAMALI)
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import HomePage from "@/modules/home/public/pages/HomePage";
import SeoFromStore from "@/modules/seo/SeoFromStore";
import { detectTenantFromHost } from "@/lib/tenant";

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

// ✅ Sadece generateMetadata export ediyoruz (metadata sabiti yok)
export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const cookieStore = await cookies();
  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const tenant = detectTenantFromHost(hostHeader) || "default";

  // Client’ın yazdığı snapshot cookie’yi oku
  const snapCookie = cookieStore.get(`seo_snap_${tenant}_home`)?.value;
  let snap: { title?: string; description?: string; og?: string } | null = null;
  try {
    if (snapCookie) snap = JSON.parse(decodeURIComponent(snapCookie));
  } catch {
    snap = null;
  }

  // Host tabanlı çok nötr fallback
  const hostName = hostHeader.replace(/^www\./, "");
  const fallbackTitle = snap?.title || hostName;
  const fallbackDescription =
    clip(snap?.description) ||
    clip(`${hostName} — çoklu tenant SaaS platformu.`);

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

export default async function HomeRoutePage() {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const cookieLocale = cookieStore.get("locale")?.value?.toLowerCase();
  const acceptLang = hdrs.get("accept-language");
  const hostHeader =
    hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";

  const locale: SupportedLocale =
    (isSupported(cookieLocale) && cookieLocale) ||
    pickFromAcceptLanguage(acceptLang) ||
    DEFAULT_LOCALE;

  return (
    <>
      {/* Store hydrate olduktan sonra <head> gerçek tenant/sayfa metasına güncellenir */}
      <SeoFromStore page="home" locale={locale} host={hostHeader} />
      <HomePage />
    </>
  );
}
