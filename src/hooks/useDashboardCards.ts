// src/hooks/useDashboardCards.ts
"use client";

import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import * as Icons from "react-icons/md";
import { useMemo } from "react";
import type { ModuleAnalyticsItem } from "@/modules/adminmodules/slice/adminModuleSlice";

export const useDashboardCards = () => {
  const { i18n } = useTranslation();
  const modules = useAppSelector((state) => state.admin.modules);
  const analytics = useAppSelector((state) => state.admin.moduleAnalytics);
  const lang = (i18n.language || "en") as "tr" | "en" | "de";

  const dashboardCards = useMemo(() => {
    if (!modules.length) return [];

    return modules
      .filter((mod) => mod.enabled && mod.showInDashboard !== false)
      .map((mod) => {
        const foundStat = analytics.find(
          (item: ModuleAnalyticsItem) => item.name === mod.name
        );

        return {
          key: mod.name,
          label: mod.label?.[lang] || mod.name,
          value: foundStat?.count ?? 0,
          path: `/admin/${mod.name}`,
          icon: dynamicIcon(mod.icon),
          statsKey: mod.statsKey,
        };
      });
  }, [modules, analytics, lang]);

  return dashboardCards;
};

// 🎯 Dinamik ikon çözümü
const dynamicIcon = (iconName?: string) => {
  if (iconName && Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons];
  }
  return Icons["MdSettings"]; // 🔥 Default icon
};
