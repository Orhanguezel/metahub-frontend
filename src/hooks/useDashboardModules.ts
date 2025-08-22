// src/modules/dashboard/hooks/useDashboardModules.ts
"use client";

import { useMemo } from "react";
import { createSelector } from "@reduxjs/toolkit";
import * as MdIcons from "react-icons/md";
import type { IconType } from "react-icons";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/dashboard/locales";
import type { SupportedLocale } from "@/types/common";
import type { IModuleMeta, IModuleSetting } from "@/modules/adminmodules/types";

export interface DashboardModule {
  key: string;
  slug: string;
  label: string;
  description: string;
  Icon: IconType;
  order: number;
  setting?: IModuleSetting;
  meta?: IModuleMeta;
}

type Options = { activeOnly?: boolean };

// ---- stable boş referanslar (yeniden yaratılmasın)
const EMPTY_ARR: any[] = [];

// ---- memoized selector (aynı input → aynı obje referansı)
const selectDashboardBase = createSelector(
  [
    (s: any) => s?.moduleSetting?.tenantModules as IModuleSetting[] | undefined,
    (s: any) => s?.moduleMeta?.modules as IModuleMeta[] | undefined,
    (s: any) =>
      Boolean(s?.moduleSetting?.loading) || Boolean(s?.moduleMeta?.loading),
  ],
  (tenantModules, metaModules, loading) => ({
    tenantModules: tenantModules ?? EMPTY_ARR,
    metaModules: metaModules ?? EMPTY_ARR,
    loading,
  })
);

export const useDashboardModules = (opts: Options = {}) => {
  const { activeOnly = true } = opts;

  // ✅ Artık memoized selector kullanıyoruz (referans stabil)
  const { tenantModules, metaModules, loading } = useAppSelector(
    selectDashboardBase
  );

  const { i18n } = useI18nNamespace("dashboard", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  const dashboardModules: DashboardModule[] = useMemo(() => {
    const base: IModuleSetting[] =
      tenantModules.length
        ? tenantModules
        : metaModules.map((m) => ({
            module: m.name,
            tenant: m.tenant,
            enabled: m.enabled,
            showInDashboard: true,
            order: m.order,
          }));

    const filtered = activeOnly
      ? base.filter((m) => m.enabled !== false && m.showInDashboard !== false)
      : base;

    const mapped: DashboardModule[] = filtered.map((setting) => {
      const name = setting.module;
      const meta = metaModules.find((m) => m.name === name);

      const label = localize(meta?.label, lang, localize(setting.seoTitle as any, lang, name));
      const description = localize((meta as any)?.description, lang, localize(setting.seoDescription as any, lang, ""));

      const slug = name === "dashboard" ? "" : name;
      const Icon = getDynamicIcon(meta?.icon);

      return {
        key: name,
        slug,
        label,
        description,
        Icon,
        order: setting.order ?? meta?.order ?? 0,
        setting,
        meta,
      };
    });

    return mapped.sort((a, b) => a.order - b.order);
  }, [tenantModules, metaModules, lang, activeOnly]);

  return { dashboardModules, isLoading: loading };
};

/* ---------------- helpers ---------------- */

function localize(
  obj: Record<string, string> | undefined,
  lang: SupportedLocale,
  fallback?: string
) {
  if (!obj) return fallback || "";
  return obj[lang] ?? obj.en ?? Object.values(obj)[0] ?? fallback ?? "";
}

function getDynamicIcon(iconName?: string): IconType {
  const fallback: IconType = MdIcons.MdWidgets;
  if (!iconName || typeof iconName !== "string") return fallback;
  const normalized = iconName in MdIcons ? iconName : `Md${capitalize(iconName)}`;
  return (MdIcons as Record<string, IconType>)[normalized] || fallback;
}

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
