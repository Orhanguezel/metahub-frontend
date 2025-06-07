"use client";
"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/shared";

export default function ProtectedAdminPage({ children }: { children: React.ReactNode }) {
  const profile = useAppSelector((state) => state.account.profile);
  const loading = useAppSelector((state) => state.account.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace("/login");
      } else if (profile.role !== "admin") {
        router.replace("/");
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return <Loading />;
  }

  if (profile.role !== "admin") return null;

  return <>{children}</>;
}
