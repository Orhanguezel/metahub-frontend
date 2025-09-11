"use client";

import { useMemo, useEffect } from "react";
import Head from "next/head";
import { useAppSelector } from "@/store/hooks";
import { buildSeoFromSlices } from "@/lib/seoMeta";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { detectTenantFromHost } from "@/lib/tenant";
import { resolveClientLocale } from "@/lib/locale";

type Props = {
  page: string;             // "home", "about", "about-detail", ...
  locale?: SupportedLocale; // verilmezse client'ta otomatik çözümlenir
  host?: string;            // verilmezse window.location.host
  content?: any;            // tekil içerik (about/blog/product)
};

function toImageUrl(img: any): string | undefined {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  return img.url || img.secureUrl || img.src || img.href || undefined;
}

const clip = (s: string | null | undefined, n = 160): string | undefined =>
  s ? (s.length > n ? s.slice(0, n - 1) + "…" : s) : undefined;

function getPathnameSafe(): string {
  if (typeof window === "undefined") return "/";
  try { return window.location.pathname || "/"; } catch { return "/"; }
}

function buildCanonicalUrl(host?: string): string | undefined {
  if (!host) return undefined;
  const naked = host.replace(/:\d+$/, "").replace(/^http(s)?:\/\//, "");
  const path = getPathnameSafe();
  return `https://${naked}${path}`;
}

export default function SeoFromStore({ page, locale, host, content }: Props) {
  const company = useAppSelector((s) => s.company?.company);
  const settings = useAppSelector((s) => s.settings?.settings);
  const tenantModules = useAppSelector((s) => s.moduleSetting?.tenantModules || []);

  const resolvedLocale: SupportedLocale =
    locale || (typeof document !== "undefined" ? resolveClientLocale() : "de");

  const resolvedHost =
    host || (typeof window !== "undefined" ? window.location.host : undefined);

  // ✅ Sadece tekil içerik varsa slug kullan (path'ten türetme yok)
  const slugPart: string = typeof content?.slug === "string" ? content.slug : "";

  // Liste route'larında pageKey = page; detayda pageKey = `${page}_${slug}`
  const pageKey = slugPart ? `${page}_${slugPart}` : page;

  const meta = useMemo(
    () =>
      buildSeoFromSlices({
        page,
        locale: resolvedLocale,
        host: resolvedHost,
        company,
        settings,
        tenantModules,
        content,
      }),
    [page, resolvedLocale, resolvedHost, company, settings, tenantModules, content]
  );

  const og: any = meta.openGraph || {};
  const tw: any = meta.twitter || {};

  const ogArr = Array.isArray(og.images) ? og.images : [];
  const ogImageUrl = toImageUrl(ogArr[0]);

  const twArr = Array.isArray(tw.images) ? tw.images : [];
  const twImageUrl = toImageUrl(twArr[0]);

  const twitterCard = tw.card || "summary_large_image";
  const ogType = og.type || "website";

  const titleStr = typeof meta.title === "string" ? meta.title : undefined;
  const descStr = clip(meta.description);

  const ogDesc = clip(typeof og.description === "string" ? og.description : undefined);
  const twDesc = clip(typeof tw.description === "string" ? tw.description : undefined);

  const canonicalUrl = buildCanonicalUrl(resolvedHost);

  // ✅ Cookie snapshot (pageKey + locale) — SSR fallback ile tam uyumlu
  useEffect(() => {
    try {
      const tenant = detectTenantFromHost(resolvedHost);
      const key = `seo_snap_${tenant || "default"}_${pageKey}_${resolvedLocale}`;
      const payload = {
        title: titleStr || "",
        description: descStr || "",
        og: ogImageUrl || "",
        ts: Date.now(),
      };
      document.cookie = `${key}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${60 *
        60}; SameSite=Lax`;
    } catch {}
  }, [pageKey, resolvedHost, resolvedLocale, titleStr, descStr, ogImageUrl]);

  // dataLayer page_view
  useEffect(() => {
    try {
      const tenant = detectTenantFromHost(resolvedHost) || "default";
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "page_view",
        page_name: page,
        tenant,
        locale: resolvedLocale,
        page_title: titleStr || "",
        page_url: canonicalUrl || "",
        slug: slugPart || undefined,
      });
    } catch {}
  }, [page, resolvedHost, resolvedLocale, titleStr, canonicalUrl, slugPart]);

  return (
    <Head>
      {/* Title / Description */}
      {titleStr ? <title>{titleStr}</title> : null}
      {descStr ? <meta name="description" content={descStr} /> : null}

      {/* Canonical + OG/Twitter URL */}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {canonicalUrl ? <meta name="twitter:url" content={canonicalUrl} /> : null}

      {/* Open Graph */}
      {og.title ? <meta property="og:title" content={String(og.title)} /> : null}
      {ogDesc ? <meta property="og:description" content={ogDesc} /> : null}
      {ogImageUrl ? <meta property="og:image" content={ogImageUrl} /> : null}
      {og.siteName ? <meta property="og:site_name" content={String(og.siteName)} /> : null}
      {ogType ? <meta property="og:type" content={String(ogType)} /> : null}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {tw.title ? <meta name="twitter:title" content={String(tw.title)} /> : null}
      {twDesc ? <meta name="twitter:description" content={twDesc} /> : null}
      {twImageUrl ? <meta name="twitter:image" content={twImageUrl} /> : null}

      {/* Hreflang */}
      {SUPPORTED_LOCALES.map((lng) =>
        canonicalUrl ? (
          <link key={lng} rel="alternate" hrefLang={lng} href={canonicalUrl} />
        ) : null
      )}
      {canonicalUrl ? (
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      ) : null}
    </Head>
  );
}
