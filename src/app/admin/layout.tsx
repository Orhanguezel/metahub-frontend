"use client";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import { Sidebar, Header, FooterSection } from "@/modules/shared";
import { Loading, ErrorMessage, ProtectedAdminPage } from "@/shared";
import { useAdminLayoutInit } from "@/hooks/useAdminLayoutInit"; // 🔑

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAdminPage>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedAdminPage>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Init Logic (hook!) ---
  const {
    adminLoading,
    adminError,
    settingsLoading,
    settingsError,
    companyStatus,
    companyError,
    availableProjects,
    selectedProject,
  } = useAdminLayoutInit();

  // --- Sidebar Toggle Logic (aynı kalabilir) ---
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

  // --- Loading & Error ---
  if (
    companyStatus === "loading" ||
    settingsLoading ||
    adminLoading ||
    !availableProjects.length ||
    !selectedProject
  ) {
    return <Loading />;
  }
  const errorMsg = companyError || adminError || settingsError;
  if (errorMsg) {
    return <ErrorMessage message={errorMsg} />;
  }

  return (
    <Wrapper>
      <ToastContainer position="top-right" autoClose={4000} />
      <SidebarWrapper $isSidebarOpen={isSidebarOpen}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </SidebarWrapper>
      <ContentWrapper $isSidebarOpen={isSidebarOpen}>
        <Header onToggleSidebar={handleToggleSidebar} onClose={handleCloseSidebar} />
        <Content onClick={isSidebarOpen ? handleCloseSidebar : undefined}>
          {children}
        </Content>
        <FooterSection />
      </ContentWrapper>
    </Wrapper>
  );
}

// --- Styled Components aynı kalabilir ---



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


