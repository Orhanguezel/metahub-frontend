'use client';

import DynamicAdminPageBuilder from "@/components/shared/DynamicAdminPageBuilder";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export default function DashboardPage() {
  const { t } = useTranslation("admin-dashboard");

  const modules = useAppSelector((state) => state.admin.modules);
  const loading = useAppSelector((state) => state.admin.loading);
  const error = useAppSelector((state) => state.admin.error);

  const mappedModules = useMemo(() => {
    return modules.map((mod) => ({
      id: mod.name,
      order: 0, 
      visible: mod.visibleInSidebar ?? true,
      props: {
        label: mod.label,
        icon: mod.icon,
        enabled: mod.enabled,
      },
    }));
  }, [modules]);

  if (loading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Modüller yüklenirken hata oluştu.")}</div>;

  return (
    <main>
      <DynamicAdminPageBuilder modules={mappedModules} />
    </main>
  );
}





