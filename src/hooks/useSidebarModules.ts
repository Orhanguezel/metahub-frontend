import { useAppSelector } from "@/store/hooks";
import * as Icons from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";

export const useSidebarModules = () => {
  const modules = useAppSelector((state) => state.admin.modules);
  const loading = useAppSelector((state) => state.admin.loading);
  const { i18n } = useTranslation("sidebar");

  const lang = (SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
    ? i18n.language
    : "en") as SupportedLocale;

  // Dinamik label helper fonksiyonu
  const sidebarModules = useMemo(
    () =>
      (modules || [])
        .filter((mod) => mod.enabled && mod.visibleInSidebar !== false)
        .map((mod) => ({
          key: mod.name,
          path: mod.name === "dashboard" ? "/admin" : `/admin/${mod.name}`,
          label: getModuleLabel(mod.label, mod.name, lang),
          Icon: dynamicIcon(mod.icon),
        })),
    [modules, lang]
  );

  return { sidebarModules, isLoading: loading };
};

// --- Helper Fonksiyonlar ---
function getModuleLabel(
  labelObj: Partial<Record<SupportedLocale, string>> | undefined,
  moduleName: string,
  preferredLang: SupportedLocale
) {
  if (labelObj?.[preferredLang]) return labelObj[preferredLang];
  for (const locale of SUPPORTED_LOCALES) {
    if (locale !== preferredLang && labelObj?.[locale]) {
      return labelObj[locale];
    }
  }
  return moduleName;
}

const dynamicIcon = (iconName?: string) => {
  if (iconName && Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons];
  }
  return Icons["MdSettings"];
};
