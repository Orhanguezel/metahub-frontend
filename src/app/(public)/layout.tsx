// /app/admin/layout.tsx
"use client";
import { PublicLayout } from "@/modules/shared";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
