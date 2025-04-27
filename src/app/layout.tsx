// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers/Providers";

export const metadata: Metadata = {
  title: "Ensotek Kühlturmsysteme",
  description: "Innovative industrielle Kühllösungen für höchste Effizienz und Nachhaltigkeit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
