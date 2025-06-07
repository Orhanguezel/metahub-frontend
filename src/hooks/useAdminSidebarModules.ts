// src/hooks/useAdminSidebarModules.ts

import { useAppSelector } from "@/store/hooks";
import { MdSettings } from "react-icons/md";

export const useAdminSidebarModules = () => {
  const modules = useAppSelector((state) => state.admin.modules);
  const loading = useAppSelector((state) => state.admin.loading);

  const sidebarModules = modules
    .filter((mod) => mod.enabled && mod.visibleInSidebar !== false)
    .map((mod) => ({
      key: mod.name,
      path: mod.name === "dashboard" ? "/admin" : `/admin/${mod.name}`,
      labelKey: `sidebar.${mod.name}`,
      icon: iconMap[mod.icon] || MdSettings,
    }));

  return { sidebarModules, isLoading: loading };
};

// --- Dynamic icon mapping ---
import * as Icons from "react-icons/md";

const iconMap: Record<string, any> = {
  ...Icons,
};
   