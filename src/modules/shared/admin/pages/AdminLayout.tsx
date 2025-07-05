"use client";

import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Sidebar, Header, FooterSection } from "@/modules/shared";
import { Loading, ErrorMessage } from "@/shared";
import { useLayoutInit } from "@/hooks/useLayoutInit"; // Merkezi hook (fetch+cleanup burada!)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Slice'ları çek
  const {
    setting,
    moduleMeta,
    moduleMaintenance,
    // ... diğer lazım olanlar
  } = useLayoutInit({
    isAdmin: true,
    adminTab: "meta",
    requireUser: true,
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleToggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Loading ve error kontrolü
  const loading =
    setting.loading ||
    moduleMeta.loading ||
    moduleMaintenance.maintenanceLoading;
    // + ihtiyacın olan diğer slice'lar

  const error =
    setting.error ||
    moduleMeta.error ||
     moduleMaintenance.maintenanceError;
    // + ihtiyacın olan diğer slice'lar

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Wrapper>
      <SidebarWrapper $isSidebarOpen={isSidebarOpen}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </SidebarWrapper>
      <ContentWrapper $isSidebarOpen={isSidebarOpen}>
        <Header onToggleSidebar={handleToggleSidebar} />
        <Content onClick={isSidebarOpen ? handleCloseSidebar : undefined}>
          {children}
        </Content>
        <FooterSection />
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
