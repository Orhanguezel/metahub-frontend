"use client";

import "./globals.css";
import Providers from "@/providers/Providers";
import SEOManager from "@/components/shared/SEOManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <SEOManager
          meta={{
            title: "Ensotek Kühlturmsysteme",
            description:
              "Innovative industrielle Kühllösungen für höchste Effizienz und Nachhaltigkeit",
            image: "/default-og-image.jpg",
            canonical: "https://ensotek.de",
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
