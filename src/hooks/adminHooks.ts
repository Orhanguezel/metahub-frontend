// src/hooks/adminHooks.ts

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import * as MdIcons from "react-icons/md";

/* --- Sidebar için Hook --- */
export const useAdminSidebarModules = () => {
  const modules = useAppSelector((state) => state.admin.modules);
  const isLoading = useAppSelector((state) => state.admin.loading);
  const error = useAppSelector((state) => state.admin.error);

  const sidebarModules = useMemo(() => {
    if (!modules?.length) return [];
    return modules
      .filter((mod) => mod.enabled && mod.visibleInSidebar) // sadece aktif ve sidebar görünürlüğü olanlar
      .map((mod) => ({
        key: mod.name,
        path: mod.name === "dashboard" ? "/admin" : `/admin/${mod.name}`,
        label: mod.label, // zaten çoklu dil label'ı geliyor
        icon: getDynamicIcon(mod.icon),
      }));
  }, [modules]);

  return { sidebarModules, isLoading, error };
};

/* --- Admin Page Builder için Hook --- */
export const useGetAdminModules = () => {
  const modules = useAppSelector((state) => state.admin.modules);
  const isLoading = useAppSelector((state) => state.admin.loading);
  const error = useAppSelector((state) => state.admin.error);

  const transformedModules = useMemo(() => {
    if (!modules?.length) return [];
    return modules.map((mod) => ({
      id: mod.name,
      visible: mod.enabled !== false,
      props: {
        label: mod.label,
        icon: mod.icon,
        enabled: mod.enabled,
      },
    }));
  }, [modules]);

  return {
    data: { modules: transformedModules },
    isLoading,
    error,
  };
};

/* --- Dinamik İkon --- */
const getDynamicIcon = (iconName?: string) => {
  if (!iconName) return MdIcons.MdSettings;
  const IconComponent = (MdIcons as Record<string, any>)[iconName];
  return IconComponent || MdIcons.MdSettings;
};
