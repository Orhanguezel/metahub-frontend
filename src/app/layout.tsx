// src/app/layout.tsx
import { TenantProvider } from "@/providers/TenantProvider";
import GlobalProviders from "@/providers/GlobalProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <TenantProvider>
          <GlobalProviders>{children}</GlobalProviders>
        </TenantProvider>
      </body>
    </html>
  );
}
