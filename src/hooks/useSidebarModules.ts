// src/hooks/useSidebarModules.ts

import { useAppSelector } from "@/store/hooks";
import * as Icons from "react-icons/md";
import { useTranslation } from "react-i18next";

export const useSidebarModules = () => {
  const modules = useAppSelector((state) => state.admin.modules);
  const loading = useAppSelector((state) => state.admin.loading);
  const { i18n } = useTranslation();

  const lang = i18n.language as "tr" | "en" | "de";

  const sidebarModules = modules
    .filter((mod) => mod.enabled && mod.visibleInSidebar !== false)
    .map((mod) => ({
      key: mod.name,
      path: mod.name === "dashboard" ? "/admin" : `/admin/${mod.name}`,
      label: mod.label?.[lang] || mod.name,
      Icon: dynamicIcon(mod.icon),
    }));

  return { sidebarModules, isLoading: loading };
};

const dynamicIcon = (iconName?: string) => {
  if (iconName && Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons];
  }
  return Icons["MdSettings"];
};
