import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "./locales";
import * as MdIcons from "react-icons/md";
import type { IModuleMeta, IModuleSetting } from "@/modules/adminmodules/types";
import type { IconType } from "react-icons";
import type { SupportedLocale } from "@/types/common";
//import { useLayoutInit } from "@/hooks/useLayoutInit";

interface SidebarModule {
  key: string;
  path: string;
  label: string;
  Icon: IconType;
}

export const useSidebarModules = () => {
  //useLayoutInit();
  // Tenant’a özel ayarlar (sadece override’lar!)
  const tenantModules: IModuleSetting[] = useAppSelector(
    (state) => state.moduleSetting.tenantModules || []
  );
  // Tüm meta (global, değişmez alanlar)
  const modules: IModuleMeta[] = useAppSelector(
    (state) => state.moduleMeta.modules || []
  );
  const loading: boolean =
    useAppSelector((state) => state.moduleSetting.loading) || false;

  const { i18n } = useI18nNamespace("common", translations);
  const lang = i18n.language?.slice(0, 2) as SupportedLocale;

  // Sidebar’da gösterilecek modüller (enabled & visibleInSidebar)
  const sidebarModules: SidebarModule[] = tenantModules
    .filter((mod) => mod.enabled !== false && mod.visibleInSidebar !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((setting) => {
      const meta = modules.find((m) => m.name === setting.module);

      // /admin veya /admin/<module> pathi
      const path =
        setting.module === "dashboard" ? "/admin" : `/admin/${setting.module}`;

      // Çoklu dil label resolve
      const label =
        meta?.label?.[lang]?.trim() ||
        meta?.label?.en?.trim() ||
        setting.module ||
        setting.module;

      const Icon: IconType = getDynamicIcon(meta?.icon);

      return {
        key: setting.module,
        path,
        label,
        Icon,
      };
    });

  return { sidebarModules, isLoading: loading };
};

// --- Dinamik ikon çözümü (type safe) ---
function getDynamicIcon(iconName?: string): IconType {
  const defaultIcon: IconType = MdIcons.MdSettings;
  if (!iconName || typeof iconName !== "string") return defaultIcon;

  // Eğer "Md" ile başlamıyorsa başına ekle ve büyük harf yap
  let normalized: string;
  if (iconName.startsWith("Md") && iconName in MdIcons) {
    normalized = iconName;
  } else {
    normalized = `Md${capitalize(iconName)}`;
  }

  // TypeScript için key existence check
  const iconComponent = (MdIcons as Record<string, IconType>)[normalized];
  return iconComponent || defaultIcon;
}

// İlk harfi büyük yapar (ör: book => Book)
function capitalize(str: string): string {
  return typeof str === "string" && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";
}
