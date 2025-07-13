// src/app/layout.tsx
import React from "react";
import GlobalProviders from "@/providers/GlobalProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
          <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
