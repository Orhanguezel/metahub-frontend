"use client";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Sidebar, Header, Footer } from "@/modules/shared";
import { useLayoutInit } from "@/hooks/useLayoutInit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTenantModuleSettings } from "@/modules/adminmodules/slices/moduleSettingSlice";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper"; // 👈 Buraya dikkat
import GlobalStyle from "@/styles/GlobalStyle";
import { fetchSettingsAdmin } from "@/modules/settings/slice/settingsSlice";

const SIDEBAR_WIDTH = 240;

interface AdminLayoutProps {
  children: React.ReactNode;
  isModalOpen?: boolean;
}

export default function AdminLayout({ children, isModalOpen = false }: AdminLayoutProps) {

  const dispatch = useAppDispatch();
  const tenant = useAppSelector(s => s.tenants.selectedTenant);

  useEffect(() => {
    // Tenant seçili ise settings fetch et
    if (tenant && tenant._id) {
      dispatch(fetchSettingsAdmin());
    }
  }, [tenant, dispatch]);

  return (
    <ThemeProviderWrapper admin>
      <GlobalStyle />
      <AdminLayoutContent isModalOpen={isModalOpen}>{children}</AdminLayoutContent>
    </ThemeProviderWrapper>
  );
}


function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
  isModalOpen?: boolean;
}) {
  useLayoutInit();

  // Direkt olarak redux'tan tenant'ı çekiyoruz:
  const tenant = useAppSelector((s) => s.tenants.selectedTenant);

  const dispatch = useAppDispatch();
  const [hasFetchedModules, setHasFetchedModules] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Dinamik ekran kontrolü
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 900);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    // Tenant geldiğinde, bir defa module fetch et
    if (tenant && tenant._id && !hasFetchedModules) {
      dispatch(fetchTenantModuleSettings());
      setHasFetchedModules(true);
    }
  }, [tenant, hasFetchedModules, dispatch]);

  // Escape ile sidebar kapama
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDesktop) setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isDesktop]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Masaüstünde sidebar daima açık, mobilde toggle
  const showSidebar = isDesktop || isSidebarOpen;

  return (
    <Wrapper>
      {/* Sidebar (daima sabit) */}
      <SidebarWrapper $showSidebar={showSidebar} $isDesktop={isDesktop}>
        <Sidebar isOpen={showSidebar} onClose={handleCloseSidebar} />
      </SidebarWrapper>
      {/* Sadece mobilde ve açıkken overlay */}
      {!isDesktop && showSidebar && <SidebarOverlay onClick={handleCloseSidebar} />}
      {/* Ana içerik */}
      <ContentWrapper $showSidebar={showSidebar} $isDesktop={isDesktop}>
        <Header onToggleSidebar={handleToggleSidebar} />
        <ContentArea>
          {children}
        </ContentArea>
        <Footer />
      </ContentWrapper>
    </Wrapper>
  );
}

// --- Styled Components ---
const Wrapper = styled.div`
font-family: ${({ theme }) => theme.fonts.body};
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
`;

const SidebarWrapper = styled.div<{ $showSidebar: boolean; $isDesktop: boolean }>`
  width: ${SIDEBAR_WIDTH}px;
  min-width: ${SIDEBAR_WIDTH}px;
  max-width: ${SIDEBAR_WIDTH}px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1300;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ $isDesktop, $showSidebar }) =>
    !$isDesktop && $showSidebar ? "0 0 24px #0017" : "none"};
  transform: ${({ $showSidebar, $isDesktop }) =>
    $isDesktop || $showSidebar ? "translateX(0)" : "translateX(-106%)"};
  transition: transform 0.26s cubic-bezier(.86,.01,.35,1.06);
  @media (max-width: 900px) {
    width: ${SIDEBAR_WIDTH}px;
    min-width: 0;
    max-width: 92vw;
    box-shadow: ${({ $showSidebar }) => ($showSidebar ? "0 0 28px #0019" : "none")};
  }
`;

const SidebarOverlay = styled.div`
  @media (max-width: 900px) {
    content: "";
    position: fixed;
    inset: 0;
    background: rgba(22,22,35,0.18);
    z-index: 1200;
    transition: background 0.17s;
    cursor: pointer;
  }
`;

const ContentWrapper = styled.div<{ $showSidebar: boolean; $isDesktop: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  margin-left: ${({ $showSidebar, $isDesktop }) =>
    $isDesktop && $showSidebar ? `${SIDEBAR_WIDTH}px` : "0"};
  transition: margin-left 0.28s cubic-bezier(.86,.01,.35,1.06);
  background: ${({ theme }) => theme.colors.background};
  @media (max-width: 900px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  min-height: 0;
  padding: 2.3rem 2vw 1.5rem 2vw;
  @media (max-width: 900px) {
    padding: 1.2rem 1vw 1rem 1vw;
  }
`;
