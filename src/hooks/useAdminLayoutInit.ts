// src/hooks/useAdminLayoutInit.ts
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAvailableProjects,
  fetchAdminModules,
  setSelectedProject,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";

export const useAdminLayoutInit = () => {
  const dispatch = useAppDispatch();

  // Store states
  const {
    availableProjects,
    selectedProject,
    fetchedAvailableProjects,
    loading: adminLoading,
    error: adminError,
  } = useAppSelector((state) => state.admin);
  const { company, status: companyStatus, error: companyError } = useAppSelector((state) => state.company);
  const { loading: settingsLoading, error: settingsError, fetchedSettings } = useAppSelector((state) => state.setting);

  // Projeleri ilk kez fetch et
  useEffect(() => {
    if (!fetchedAvailableProjects) {
      dispatch(fetchAvailableProjects());
    }
  }, [fetchedAvailableProjects, dispatch]);

  // İlk projeyi seç
  const didSelectDefaultProject = useRef(false);
  useEffect(() => {
    if (
      availableProjects.length > 0 &&
      !selectedProject &&
      !didSelectDefaultProject.current
    ) {
      dispatch(setSelectedProject(availableProjects[0]));
      didSelectDefaultProject.current = true;
    }
  }, [availableProjects, selectedProject, dispatch]);

  // Proje değiştikçe modülleri fetch et (ve tekrar fetch’i engelle)
  const fetchedProject = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProject && selectedProject !== fetchedProject.current) {
      dispatch(fetchAdminModules(selectedProject));
      fetchedProject.current = selectedProject;
    }
  }, [selectedProject, dispatch]);

  // Şirket ve ayarları sadece bir defa fetch et
  useEffect(() => {
    if (!company && companyStatus === "idle") {
      dispatch(fetchCompanyInfo());
    }
    if (!fetchedSettings) {
      dispatch(fetchSettings());
    }
  }, [dispatch, company, companyStatus, fetchedSettings]);

  return {
    adminLoading,
    adminError,
    settingsLoading,
    settingsError,
    companyStatus,
    companyError,
    availableProjects,
    selectedProject,
  };
};
