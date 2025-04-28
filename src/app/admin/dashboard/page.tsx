"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import {
  fetchAdminModules,
  fetchAvailableProjects,
  fetchAllModulesAnalytics,
  setSelectedProject,
} from "@/store/adminSlice";
import DynamicAdminPageBuilder from "@/components/shared/DynamicAdminPageBuilder";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("admin-dashboard");

  const modules = useAppSelector((state) => state.admin.modules);
  const analytics = useAppSelector((state) => state.admin.moduleAnalytics);
  const loading = useAppSelector((state) => state.admin.loading);
  const error = useAppSelector((state) => state.admin.error);
  const selectedProject = useAppSelector((state) => state.admin.selectedProject);
  const availableProjects = useAppSelector((state) => state.admin.availableProjects);

  // ⭐ İlk yüklemede Proje ve Modülleri çekelim
  useEffect(() => {
    dispatch(fetchAvailableProjects());
  }, [dispatch]);

  useEffect(() => {
    if (availableProjects.length > 0) {
      if (!selectedProject) {
        dispatch(setSelectedProject(availableProjects[0]));
      } else {
        dispatch(fetchAdminModules(selectedProject));
        dispatch(fetchAllModulesAnalytics());
      }
    }
  }, [availableProjects, selectedProject, dispatch]);

  const mappedModules = useMemo(() => {
    const lang = (i18n.language || "en") as "tr" | "en" | "de";

    if (!modules.length) return [];

    return modules
      .filter((mod) => mod.showInDashboard !== false)
      .map((mod) => {
        const foundAnalytics = analytics.find((item) => item.name === mod.name);

        return {
          id: mod.name,
          order: mod.order ?? 0,
          visible: true,
          props: {
            label: mod.label?.[lang] || mod.name,
            icon: mod.icon,
            enabled: mod.enabled,
            count: foundAnalytics?.count ?? 0, // ✅ COUNT BURADA KALDI
          },
        };
      })
      .sort((a, b) => a.order - b.order); // ✅ Sıralama burada yapılıyor
  }, [modules, analytics, i18n.language]);

  if (loading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Modüller yüklenirken hata oluştu.")}</div>;

  return (
    <main>
      <DynamicAdminPageBuilder modules={mappedModules} />
    </main>
  );
}
