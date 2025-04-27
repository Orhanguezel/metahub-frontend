"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { fetchAdminModules, fetchAvailableProjects, setSelectedProject } from "@/store/adminSlice";
import DynamicAdminPageBuilder from "@/components/shared/DynamicAdminPageBuilder";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("admin-dashboard");

  const modules = useAppSelector((state) => state.admin.modules);
  const loading = useAppSelector((state) => state.admin.loading);
  const error = useAppSelector((state) => state.admin.error);
  const selectedProject = useAppSelector((state) => state.admin.selectedProject);
  const availableProjects = useAppSelector((state) => state.admin.availableProjects);

  // ⭐ İlk yüklemede Project ve Module çekelim
  useEffect(() => {
    dispatch(fetchAvailableProjects());
  }, [dispatch]);

  useEffect(() => {
    if (availableProjects.length > 0) {
      if (!selectedProject) {
        dispatch(setSelectedProject(availableProjects[0]));
      } else {
        dispatch(fetchAdminModules(selectedProject));
      }
    }
  }, [availableProjects, selectedProject, dispatch]);

  const mappedModules = useMemo(() => {
    const lang = (i18n.language || "en") as "tr" | "en" | "de";

    return modules
      .filter((mod) => mod.showInDashboard !== false) // 🔥 sadece Dashboard'a görünürler
      .map((mod) => ({
        id: mod.name,
        order: 0,
        visible: true,
        props: {
          label: mod.label?.[lang] || mod.name,
          icon: mod.icon,
          enabled: mod.enabled,
        },
      }));
  }, [modules, i18n.language]);

  if (loading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Modüller yüklenirken hata oluştu.")}</div>;

  return (
    <main>
      <DynamicAdminPageBuilder modules={mappedModules} />
    </main>
  );
}
