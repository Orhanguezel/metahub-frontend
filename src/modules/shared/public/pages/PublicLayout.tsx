"use client";
import React, { useState, useEffect } from "react";
import { Navbar, FooterSection } from "@/modules/shared";
import { Loading, ErrorMessage } from "@/shared";
import { usePublicLayoutInit } from "@/hooks/usePublicLayoutInit";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import GlobalStyle from "@/styles/GlobalStyle";
import { useAppSelector } from "@/store/hooks";

// HYDRATION: Sadece client'ta render başlatmak için hook
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const mounted = useMounted(); // 👈 SSR mismatch'ı önler
  const tenant = useAppSelector((state) => state.tenants.selectedTenant);
  const tenantLoading = useAppSelector((state) => state.tenants.loading);

  // Tüm public verileri, slice'lardan initialize ediyoruz
  const {
    settingsLoading,
    settingsError,
    companyStatus,
    companyError,
  } = usePublicLayoutInit();

  // --- HYDRATION SAFE: İlk SSR render'da DOM üretme ---
  if (!mounted) return null;

  // --- Tenant veya Settings Loading ---
  if (!tenant || tenantLoading) return <Loading />;
  if (settingsLoading || companyStatus === "loading") return <Loading />;
  if (settingsError || companyError) {
    return <ErrorMessage message={settingsError || companyError || "An error occurred."} />;
  }

  // --- HER ŞEY HAZIR: Layout'u Render Et ---
  return (
    <ThemeProviderWrapper>
      <GlobalStyle />
      <Navbar />
      <main id="main-content">{children}</main>
      <FooterSection />
    </ThemeProviderWrapper>
  );
}
