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
  deleteSectionSetting,
} from "@/modules/section/slices/sectionSettingSlice";
import {
  clearSectionMetaMessages,
  deleteSectionMeta, // DİKKAT: import sectionMetaSlice'tan olmalı!
} from "@/modules/section/slices/sectionMetaSlice";
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
    const label = meta.label?.[lang] || meta.sectionKey;
    const matchesSearch = label.toLowerCase().includes(search.toLowerCase());
    const setting = settingsAdmin.find((s: ISectionSetting) => s.sectionKey === meta.sectionKey);
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
  const handleSelect = useCallback((sectionKey: string) => {
    setSelectedKeys((prev) =>
      prev.includes(sectionKey) ? prev.filter((k) => k !== sectionKey) : [...prev, sectionKey]
    );
  }, []);

  // Edit Modal aç/kapat
  const handleEdit = useCallback((meta: ISectionMeta, setting?: ISectionSetting) => {
    setEditTarget({ meta, setting });
  }, []);

  // Save (CREATE or UPDATE)
  const handleSaveEdit = useCallback(
    async (data: Partial<ISectionSetting>) => {
      if (!editTarget) return;
      const sectionKey = editTarget.meta.sectionKey;
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

  // --- Bulk Delete
  const handleBulkDelete = useCallback(async (selected: string[]) => {
    const toDelete = selected
      .map((sectionKey) => {
        const setting = settingsAdmin.find((s) => s.sectionKey === sectionKey);
        return { sectionKey, setting };
      })
      .filter(item => !!item.sectionKey);

    if (toDelete.length === 0) {
      setSnackbar({ message: t("error.noSelectedToDelete", "No selected settings to delete!"), type: "error", open: true });
      return;
    }
    try {
      for (const { sectionKey, setting } of toDelete) {
        if (setting) {
          await dispatch(deleteSectionSetting({ sectionKey: sectionKey })).unwrap();
        }
        await dispatch(deleteSectionMeta(sectionKey)).unwrap();
      }
      setSnackbar({ message: t("success.bulkDeleted", "Selected deleted!"), type: "success", open: true });
      setSelectedKeys([]);
    } catch (err: any) {
      setSnackbar({ message: err?.message || t("error", "Error!"), type: "error", open: true });
    }
  }, [dispatch, settingsAdmin, t]);

  // --- Bulk Enable
  const handleBulkEnable = useCallback(async (selected: string[]) => {
    try {
      for (const sectionKey of selected) {
        const setting = settingsAdmin.find((s) => s.sectionKey === sectionKey);
        if (setting) {
          await dispatch(updateSectionSetting({ sectionKey: sectionKey, data: { enabled: true } })).unwrap();
        } else {
          const meta = metasAdmin.find((m) => m.sectionKey === sectionKey);
          if (meta) {
            await dispatch(createSectionSetting({ sectionKey: sectionKey, enabled: true })).unwrap();
          }
        }
      }
      setSnackbar({ message: t("success.bulkEnabled", "Selected enabled!"), type: "success", open: true });
      setSelectedKeys([]);
    } catch (err: any) {
      setSnackbar({ message: err?.message || t("error", "Error!"), type: "error", open: true });
    }
  }, [dispatch, metasAdmin, settingsAdmin, t]);

  // --- Bulk Disable
  const handleBulkDisable = useCallback(async (selected: string[]) => {
    try {
      for (const sectionKey of selected) {
        const setting = settingsAdmin.find((s) => s.sectionKey === sectionKey);
        if (setting) {
          await dispatch(updateSectionSetting({ sectionKey: sectionKey, data: { enabled: false } })).unwrap();
        }
      }
      setSnackbar({ message: t("success.bulkDisabled", "Selected disabled!"), type: "success", open: true });
      setSelectedKeys([]);
    } catch (err: any) {
      setSnackbar({ message: err?.message || t("error", "Error!"), type: "error", open: true });
    }
  }, [dispatch, settingsAdmin, t]);

  // Tekli silme (satırdaki X butonu)
  const handleDeleteSection = useCallback(
    async (meta: ISectionMeta, setting?: ISectionSetting) => {
      try {
        if (setting) {
          await dispatch(deleteSectionSetting({ sectionKey: setting.sectionKey })).unwrap();
        }
        await dispatch(deleteSectionMeta(meta.sectionKey)).unwrap();
        setSnackbar({ message: t("success.deleted", "Deleted!"), type: "success", open: true });
      } catch (err: any) {
        setSnackbar({ message: err?.message || t("error", "Error!"), type: "error", open: true });
      }
    },
    [dispatch, t]
  );

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
        onDelete={handleDeleteSection}
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
