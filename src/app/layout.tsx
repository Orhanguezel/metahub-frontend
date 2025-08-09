// src/app/layout.tsx
import React from "react";
import GlobalProviders from "@/providers/GlobalProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sadece favicon, tenant veya başka meta yok */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
