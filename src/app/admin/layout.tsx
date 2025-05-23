"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import {
  fetchAdminModules,
  fetchAvailableProjects,
  setSelectedProject,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Loading,ErrorMessage} from "@/shared";
import { Sidebar,Header,Footer } from "@/modules/shared";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useAppDispatch();

  // --- STATE ---
  const companyState = useAppSelector((state) => state.company);
  const adminState = useAppSelector((state) => state.admin);
  const settingsState = useAppSelector((state) => state.setting);

  // --- SLICED STATES ---
  const { company, status: companyStatus, error: companyError } = companyState;
  const {
    modules: adminModules,
    loading: adminLoading,
    error: adminError,
    selectedProject,
    availableProjects,
    fetchedAvailableProjects,
  } = adminState;
  const { loading: settingsLoading, error: settingsError, fetchedSettings } = settingsState;

  useEffect(() => {
  console.log("admin slice:", {
    availableProjects,
    selectedProject,
    adminModules,
    adminLoading
  });
}, [availableProjects, selectedProject, adminModules, adminLoading]);


  // --- 1. Projeleri çek (ilk mount)
  useEffect(() => {
    if (!fetchedAvailableProjects) {
      dispatch(fetchAvailableProjects());
    }
  }, [dispatch, fetchedAvailableProjects]);

  // --- 2. Şirket & Ayarlar (ilk mount)
  useEffect(() => {
    if (!company && companyStatus === "idle") {
      dispatch(fetchCompanyInfo());
    }
    if (!fetchedSettings) {
      dispatch(fetchSettings());
    }
  }, [dispatch, company, companyStatus, fetchedSettings]);

  // --- 3. Proje geldiğinde, seçili yoksa ilk projeyi ata
  useEffect(() => {
    if (availableProjects.length > 0 && !selectedProject) {
      dispatch(setSelectedProject(availableProjects[0]));
    }
  }, [dispatch, availableProjects, selectedProject]);

  // --- 4. Proje değiştiğinde modülleri çek
  useEffect(() => {
    if (selectedProject && (!adminModules || adminModules.length === 0)) {
      dispatch(fetchAdminModules(selectedProject));
    }
  }, [dispatch, selectedProject, adminModules]);

  // --- ESC ile sidebar kapama
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // --- Sidebar toggle
  const handleToggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

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

  // --- LAYOUT ---
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
        <Footer company={company} />

      </ContentWrapper>
    </Wrapper>
  );
}

// ---- STYLES ----
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
