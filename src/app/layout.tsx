import React from "react";
import GlobalProviders from "@/providers/GlobalProviders";
import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";

export const dynamic = "force-dynamic";

const DEFAULT_LOCALE: SupportedLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "de";

const RTL_SET = new Set(["ar","fa","he","ur","ckb","ps","sd","ug","yi","dv"]);
const isSupported = (x?: string): x is SupportedLocale =>
  !!x && (SUPPORTED_LOCALES as readonly string[]).includes(x as any);

function pickFromAcceptLanguage(al: string | null): SupportedLocale | null {
  if (!al) return null;
  const items = al.split(",").map((s) => {
    const [tag, qPart] = s.trim().split(";q=");
    const q = qPart ? parseFloat(qPart) : 1;
    const primary = tag.split("-")[0]?.toLowerCase() || "";
    return { primary, q };
  }).filter(x => !!x.primary).sort((a,b)=>b.q-a.q);
  for (const {primary} of items) if (isSupported(primary)) return primary;
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hdrs = await headers();

  const cookieLocale = cookieStore.get("locale")?.value?.toLowerCase();
  const acceptLang = hdrs.get("accept-language");
  const locale: SupportedLocale =
    (isSupported(cookieLocale) && cookieLocale) ||
    pickFromAcceptLanguage(acceptLang) ||
    DEFAULT_LOCALE;

  const dir = RTL_SET.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* favicon middleware /favicon.ico → /favicons/{tenant}.ico rewrite ediyor */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      {/* bazı eklentiler (ör. "cz-shortcut-listen") body attr ekler → mismatch uyarısı olmasın */}
      <body suppressHydrationWarning>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
