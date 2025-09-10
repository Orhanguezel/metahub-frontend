"use client";

import { useMemo, useEffect } from "react";
import Head from "next/head";
import { useAppSelector } from "@/store/hooks";
import { buildSeoFromSlices } from "@/lib/seoMeta";
import type { SupportedLocale } from "@/types/common";
import { detectTenantFromHost } from "@/lib/tenant";

type Props = {
  page: string;             // "home", "about", ...
  locale?: SupportedLocale; // verilmezse document.lang
  host?: string;            // verilmezse window.location.host
};

// images alanı string veya {url,...} olabilir -> tek url'e indir
function toImageUrl(img: any): string | undefined {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.url || img.secureUrl || img.src || img.href || undefined;
}

// ✅ clip artık null'u da kabul ediyor
const clip = (s: string | null | undefined, n = 160): string | undefined =>
  s ? (s.length > n ? s.slice(0, n - 1) + "…" : s) : undefined;

export default function SeoFromStore({ page, locale, host }: Props) {
  const company = useAppSelector((s) => s.company?.company);
  const settings = useAppSelector((s) => s.settings?.settings);
  const tenantModules = useAppSelector((s) => s.moduleSetting?.tenantModules || []);

  const resolvedLocale =
    locale ||
    (typeof document !== "undefined"
      ? ((document.documentElement.lang as SupportedLocale) || "en")
      : "en");

  const resolvedHost =
    host || (typeof window !== "undefined" ? window.location.host : undefined);

  const meta = useMemo(
    () =>
      buildSeoFromSlices({
        page,
        locale: resolvedLocale,
        host: resolvedHost,
        company,
        settings,
        tenantModules,
      }),
    [page, resolvedLocale, resolvedHost, company, settings, tenantModules]
  );

  // Tip uyuşmazlıklarını önlemek için gevşek objeler:
  const og: any = meta.openGraph || {};
  const tw: any = meta.twitter || {};

  const ogArr = Array.isArray(og.images) ? og.images : [];
  const ogImageUrl = toImageUrl(ogArr[0]);

  const twArr = Array.isArray(tw.images) ? tw.images : [];
  const twImageUrl = toImageUrl(twArr[0]);

  const twitterCard = tw.card || "summary_large_image";
  const ogType = og.type || "website";

  // 🔧 Önce güvenli string'leri hazırlayalım
  const titleStr = typeof meta.title === "string" ? meta.title : undefined;
  const descStr = clip(meta.description); // artık null'u kabul ediyor

  const ogDesc = clip(typeof og.description === "string" ? og.description : undefined);
  const twDesc = clip(typeof tw.description === "string" ? tw.description : undefined);

  // ✅ SEO snapshot'ı cookie'ye yaz (server bir sonraki istekte SSR fallback olarak kullanır)
  useEffect(() => {
    try {
      const tenant = detectTenantFromHost(resolvedHost);
      const key = `seo_snap_${tenant || "default"}_${page}`;
      const payload = {
        title: titleStr || "",
        description: descStr || "",
        og: ogImageUrl || "",
        ts: Date.now(),
      };
      document.cookie = `${key}=${encodeURIComponent(
        JSON.stringify(payload)
      )}; Path=/; Max-Age=${60 * 60}; SameSite=Lax`;
    } catch {
      /* yut */
    }
  }, [page, resolvedHost, titleStr, descStr, ogImageUrl]);

  return (
    <Head>
      {/* Title / Description */}
      {titleStr ? <title>{titleStr}</title> : null}
      {descStr ? <meta name="description" content={descStr} /> : null}

      {/* Open Graph */}
      {og.title ? <meta property="og:title" content={String(og.title)} /> : null}
      {ogDesc ? <meta property="og:description" content={ogDesc} /> : null}
      {ogImageUrl ? <meta property="og:image" content={ogImageUrl} /> : null}
      {og.siteName ? (
        <meta property="og:site_name" content={String(og.siteName)} />
      ) : null}
      {ogType ? <meta property="og:type" content={String(ogType)} /> : null}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {tw.title ? <meta name="twitter:title" content={String(tw.title)} /> : null}
      {twDesc ? <meta name="twitter:description" content={twDesc} /> : null}
      {twImageUrl ? <meta name="twitter:image" content={twImageUrl} /> : null}
    </Head>
  );
}
