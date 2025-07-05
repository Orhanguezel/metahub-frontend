// /app/admin/layout.tsx
"use client";
import { AdminLayout } from "@/modules/shared";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
