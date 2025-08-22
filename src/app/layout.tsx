// src/app/layout.tsx
import React from "react";
import { headers } from "next/headers";
import GlobalProviders from "@/providers/GlobalProviders";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server Component olduğu için header'ı burada okuyabiliriz
  const host = headers().get("host") || "";
  const tenant = detectTenantFromHost(host);
  const faviconHref = getFaviconPathForTenant(tenant);

  return (
    <html lang="en">
      <head>
        {/* Tenant’a özel favicon; middleware de /favicon.ico’yı aynı hedefe rewrite ediyor */}
        <link rel="icon" href={faviconHref} sizes="any" />
      </head>
      <body suppressHydrationWarning>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
