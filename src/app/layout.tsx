// src/app/layout.tsx
import React from "react";
import GlobalProviders from "@/providers/GlobalProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Middleware /favicon.ico'yu tenant'a göre /favicons/{tenant}.ico'ya rewrite ediyor */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
