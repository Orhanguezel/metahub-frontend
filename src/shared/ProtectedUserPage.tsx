// shared/ProtectedUserPage.tsx
"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/shared";

export default function ProtectedUserPage({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // User yükleniyorsa ekrana loader bas
  if (loading || !user) {
    return <Loading />;
  }

  return <>{children}</>;
}
