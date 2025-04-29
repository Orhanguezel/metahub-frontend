"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings } from "@/store/settingSlice";
import {
  fetchAvailableProjects,
  fetchAdminModules,
  setSelectedProject,
} from "@/store/adminSlice";
import Loading from "@/components/shared/Loading";
import ErrorMessage from "@/components/shared/ErrorMessage";
import AdminSettingsPage from "@/modules/settings/AdminSettingsPage";

export default function AdminSettingRoutePage() {
  const dispatch = useAppDispatch();

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchedSettings,
  } = useAppSelector((state) => state.setting);

  const {
    availableProjects,
    selectedProject,
    loading: projectsLoading,
    error: projectsError,
    fetchedAvailableProjects,
  } = useAppSelector((state) => state.admin);

  // 🛡️ İlk açılışta Projeler ve Settings çek
  useEffect(() => {
    if (!fetchedAvailableProjects) {
      dispatch(fetchAvailableProjects());
    }
    if (!fetchedSettings) {
      dispatch(fetchSettings());
    }
  }, [dispatch, fetchedAvailableProjects, fetchedSettings]);

  // 🔁 Projeler geldikten sonra selectedProject ayarla
  useEffect(() => {
    if (Array.isArray(availableProjects) && availableProjects.length > 0 && !selectedProject) {
      dispatch(setSelectedProject(availableProjects[0]));
    }
  }, [availableProjects, selectedProject, dispatch]);
  

  // 🔁 Seçili proje varsa modülleri çek
  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchAdminModules(selectedProject));
    }
  }, [selectedProject, dispatch]);

  // 🛡️ Loading veya Error ekranı
  if (settingsLoading || projectsLoading) return <Loading />;
  if (settingsError || projectsError) return <ErrorMessage />;

  // ✅ Başarılıysa settings verisini AdminSettingsPage'e gönder
  return (
    <main>
      <AdminSettingsPage settings={settings} />
    </main>
  );
}
