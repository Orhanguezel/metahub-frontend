// src/hooks/useDashboardCards.ts
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { dashboardModules } from "@/store/dashboard/dashboardConfig";

export const useDashboardCards = () => {
  const { t } = useTranslation();
  const stats = useSelector((state: RootState) => state.dashboard.stats);

  return dashboardModules.map(({ key, labelKey, path, icon, getValue }) => ({
    key,
    label: t(labelKey),
    value: getValue(stats),
    path,
    icon,
  }));
};
