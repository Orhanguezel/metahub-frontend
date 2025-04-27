import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import * as MdIcons from "react-icons/md";
import { useMemo } from "react";

export const useDashboardCards = () => {
  const { i18n } = useTranslation();
  const modules = useAppSelector((state) => state.admin.modules);
  const stats = useAppSelector((state) => state.dashboard.stats);

  const lang = i18n.language as "tr" | "en" | "de";

  const dashboardCards = useMemo(() => {
    return modules
      .filter((mod) => mod.enabled)
      .map((mod) => ({
        key: mod.name,
        label: mod.label?.[lang] || mod.name,
        value:
          (mod.statsKey && stats?.[mod.statsKey as keyof typeof stats]) ||
          (stats?.[mod.name as keyof typeof stats]) ||
          "-",
        path: `/admin/${mod.name}`,
        icon: getDynamicIcon(mod.icon),
      }));
  }, [modules, stats, lang]);

  return dashboardCards;
};

// 🔥 İkon bulma fonksiyonu
const getDynamicIcon = (iconName?: string) => {
  if (!iconName) return MdIcons.MdSettings;
  const IconComponent = (MdIcons as Record<string, any>)[iconName];
  return IconComponent || MdIcons.MdSettings;
};
