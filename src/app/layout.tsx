// frontend/src/app/layout.tsx
import React from "react";
import GlobalProviders from "@/providers/GlobalProviders";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import {
  detectTenantFromHost,
  getFaviconPathForTenant,
  getAnalyticsMeta,     // ⬅️ eklendi
} from "@/lib/tenant";
import GtmProvider from "@/shared/analytics/GtmProvider"; // ⬅️ eklendi

export const dynamic = "force-dynamic";

const DEFAULT_LOCALE: SupportedLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "de";

const RTL_SET = new Set(["ar","fa","he","ur","ckb","ps","sd","ug","yi","dv"]);
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
    .filter((x) => !!x.primary)
    .sort((a, b) => b.q - a.q);

  for (const { primary } of items) if (isSupported(primary)) return primary;
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const tenant = detectTenantFromHost(host) || "metahub";

  const ico = getFaviconPathForTenant(tenant); // /favicons/<tenant>.ico
  const v = tenant; // cache-bust

  return {
    icons: {
      icon: [
        { url: `${ico}?v=${v}`, type: "image/x-icon" },
        { url: `/favicon.ico?v=${v}`, type: "image/x-icon" }, // kök fallback
        { url: `/favicons/${tenant}-32.png?v=${v}`, type: "image/png", sizes: "32x32" },
        { url: `/favicons/${tenant}-16.png?v=${v}`, type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: `/favicons/${tenant}-apple-180.png?v=${v}`, sizes: "180x180" }],
      shortcut: [{ url: `${ico}?v=${v}` }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hdrs = await headers();

  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const tenant = detectTenantFromHost(host) || "metahub";
  const { gtmId } = getAnalyticsMeta(tenant); // ⬅️ ensotek’te GTM-TZRVT3ZB gelir

  const cookieLocale = cookieStore.get("locale")?.value?.toLowerCase();
  const acceptLang = hdrs.get("accept-language");
  const locale: SupportedLocale =
    (isSupported(cookieLocale) && cookieLocale) ||
    pickFromAcceptLanguage(acceptLang) ||
    DEFAULT_LOCALE;

  const dir = RTL_SET.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-tenant={tenant} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        {/* BODY açılışından HEMEN SONRA: sadece ilgili tenant’ta GTM */}
        {!!gtmId && <GtmProvider containerId={gtmId} />}

        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
