"use client";

import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Sidebar, Header, Footer } from "@/modules/shared";
import { useLayoutInit } from "@/hooks/useLayoutInit";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useAppDispatch } from "@/store/hooks";
import { fetchTenantModuleSettings } from "@/modules/adminmodules/slices/moduleSettingSlice";

// --- Props tipini güncelle --- //
interface AdminLayoutProps {
  children: React.ReactNode;
  isModalOpen?: boolean; // yeni ekledik!
}

export default function AdminLayout({ children, isModalOpen = false }: AdminLayoutProps) {
  return <AdminLayoutContent isModalOpen={isModalOpen}>{children}</AdminLayoutContent>;
}

function AdminLayoutContent({
  children,
  isModalOpen = false,
}: {
  children: React.ReactNode;
  isModalOpen?: boolean;
}) {
  // Merkezi slice fetch (dashboard, modüller vs.)
  useLayoutInit();

  // Aktif tenant id (tek kaynaktan)
  const tenantId = useActiveTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tenant modules fetch
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (tenantId) {
      dispatch(fetchTenantModuleSettings());
    }
  }, [tenantId, dispatch]);

  // Escape ile sidebar kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Sidebar aç/kapat fonksiyonları
  const handleToggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // --- Layout Render ---
  return (
    <Wrapper>
      <SidebarWrapper $isSidebarOpen={isSidebarOpen}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </SidebarWrapper>
      <ContentWrapper $isSidebarOpen={isSidebarOpen}>
        <Header onToggleSidebar={handleToggleSidebar} />
        {/* Modal state yukarıdan prop olarak gelir */}
        <Content
          onClick={isSidebarOpen && !isModalOpen ? handleCloseSidebar : undefined}
        >
          {children}
        </Content>
        <Footer />
      </ContentWrapper>
    </Wrapper>
  );
}

// --- Styled Components ---
const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const SidebarWrapper = styled.div<{ $isSidebarOpen: boolean }>`
  width: 250px;
  background: ${({ theme }) => theme.colors.background};
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease;
  @media (max-width: 768px) {
    width: ${({ $isSidebarOpen }) => ($isSidebarOpen ? "250px" : "0")};
    overflow: hidden;
  }
`;

const ContentWrapper = styled.div<{ $isSidebarOpen: boolean }>`
  margin-left: 250px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  transition: margin-left 0.3s ease;
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
`;

