// shared/ProtectedAdminPage.tsx
"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/shared";

export default function ProtectedAdminPage({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        router.replace("/"); // ya da /account, ana sayfa vs.
      }
    }
  }, [user, loading, router]);

  // User yükleniyorsa ekrana loader bas
  if (loading || !user) {
    return <Loading />;
  }

  // Sadece admin rolü ise devam etsin
  if (user.role !== "admin") return null;

  return <>{children}</>;
}
