// /home/orhan/Dokumente/metahub-frontend/src/app/(public)/layout.tsx
"use client";
import { PublicLayout } from "@/modules/shared";

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
