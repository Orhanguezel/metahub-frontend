"use client";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { SectionTable, SectionEditModal, SectionFilterBar, SectionBulkActions, SectionSnackbar } from "@/modules/section";
import {
  clearSectionSettingMessages,
  updateSectionSetting,
  createSectionSetting,
} from "@/modules/section/slices/sectionSettingSlice";
import { clearSectionMetaMessages } from "@/modules/section/slices/sectionMetaSlice";
import type { ISectionMeta, ISectionSetting } from "@/modules/section/types";
import type { SupportedLocale } from "@/types/common";

export default function AdminSectionPage() {
  const { i18n, t } = useI18nNamespace("section", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Store
  const {
    metasAdmin = [],
    loading: loadingMetas,
    error: errorMetas,
    successMessage: metaSuccess,
  } = useAppSelector((s) => s.sectionMeta);
  const {
    settingsAdmin = [],
    loading: loadingSettings,
    error: errorSettings,
    successMessage: settingSuccess,
  } = useAppSelector((s) => s.sectionSetting);
  const dispatch = useAppDispatch();

  // Local State
  const [search, setSearch] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<{ meta: ISectionMeta; setting?: ISectionSetting } | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" | "info"; open: boolean }>({
    message: "", type: "success", open: false,
  });

  // Filtered & Searched
  const filteredMetas = useMemo(() => metasAdmin.filter((meta: ISectionMeta) => {
    const label = meta.label?.[lang] || meta.key;
    const matchesSearch = label.toLowerCase().includes(search.toLowerCase());
    const setting = settingsAdmin.find((s: ISectionSetting) => s.sectionKey === meta.key);
    const enabledVal = setting?.enabled ?? meta.defaultEnabled;
    const matchesEnabled =
      enabledFilter === "all"
        ? true
        : enabledFilter === "enabled"
        ? enabledVal
        : !enabledVal;
    return matchesSearch && matchesEnabled;
  }), [metasAdmin, settingsAdmin, search, enabledFilter, lang]);

  useEffect(() => {
    if (settingSuccess) toast.success(settingSuccess);
    if (errorMetas) toast.error(errorMetas);
    if (loadingMetas) toast.info(t("loading", "Loading..."));
    if (loadingSettings) toast.info(t("loading", "Loading..."));
    if (errorSettings) toast.error(errorSettings);
    if (metaSuccess) toast.success(metaSuccess);
    if (settingSuccess || errorSettings) dispatch(clearSectionSettingMessages());
    if (errorMetas) dispatch(clearSectionMetaMessages());
  }, [settingSuccess, metaSuccess, loadingSettings, errorSettings, errorMetas, loadingMetas, dispatch, t]);

  // Select Row
  const handleSelect = useCallback((key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // Edit Modal aç/kapat
  const handleEdit = useCallback((meta: ISectionMeta, setting?: ISectionSetting) => {
    setEditTarget({ meta, setting });
  }, []);

  // Save (CREATE or UPDATE) - tenant asla env’den gelmiyor, sadece setting’ten
 const handleSaveEdit = useCallback(
  async (data: Partial<ISectionSetting>) => {
    if (!editTarget) return;
    const sectionKey = editTarget.meta.key;
    const payload: Partial<ISectionSetting> = { ...data, sectionKey };
    Object.keys(payload).forEach(k => (payload as any)[k] === undefined && delete (payload as any)[k]);
    try {
      if (editTarget.setting) {
        await dispatch(updateSectionSetting({ sectionKey, data: payload })).unwrap();
        setSnackbar({ message: t("success.saved"), type: "success", open: true });
      } else {
        await dispatch(createSectionSetting(payload)).unwrap();
        setSnackbar({ message: t("success.created", "Created!"), type: "success", open: true });
      }
    } catch (err: any) {
      setSnackbar({ message: err?.message || t("error", "Error!"), type: "error", open: true });
    }
    setEditTarget(null);
  },
  [dispatch, editTarget, t]
);



  // Bulk actions (dummy/UX only)
  const handleBulkDelete = useCallback(() => {
    setSnackbar({ message: t("notImplemented", "Not implemented!"), type: "info", open: true });
  }, [t]);
  const handleBulkEnable = useCallback(() => {
    setSnackbar({ message: t("notImplemented", "Not implemented!"), type: "info", open: true });
  }, [t]);
  const handleBulkDisable = useCallback(() => {
    setSnackbar({ message: t("notImplemented", "Not implemented!"), type: "info", open: true });
  }, [t]);

  return (
    <Wrapper>
      <Title>{t("section.title", "Section Management")}</Title>

      <SectionFilterBar
        search={search}
        setSearch={setSearch}
        enabledFilter={enabledFilter}
        setEnabledFilter={setEnabledFilter}
      />
      <SectionBulkActions
        selected={selectedKeys}
        onDelete={handleBulkDelete}
        onEnable={handleBulkEnable}
        onDisable={handleBulkDisable}
      />
      <SectionTable
        metasAdmin={filteredMetas}
        settings={settingsAdmin}
        onEdit={handleEdit}
        onSelect={handleSelect}
        selectedKeys={selectedKeys}
      />
      <SectionEditModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        meta={editTarget?.meta ?? ({} as ISectionMeta)}
        setting={editTarget?.setting}
        onSave={handleSaveEdit}
      />
      <SectionSnackbar
        message={snackbar.message}
        type={snackbar.type}
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 2rem;
`;
