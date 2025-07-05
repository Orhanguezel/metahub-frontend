"use client";

import React, { useCallback, useState, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import {
  AdminSettingsList,
  AdminSettingsForm,
  ThemeManager,
} from "@/modules/settings";
import Modal from "@/shared/Modal";
import styled from "styled-components";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { ISetting } from "@/modules/settings/types";

export default function AdminSettingsPage() {
  const { i18n, t } = useI18nNamespace("settings", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale; 
  const { settings, loading, error } = useAppSelector((state) => state.setting);

  const [selectedSetting, setSelectedSetting] = useState<ISetting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- THEMES ---
  const availableThemesSetting = settings.find((s) => s.key === "available_themes");

  const availableThemes = useMemo(() => {
    if (Array.isArray(availableThemesSetting?.value)) {
      return availableThemesSetting.value;
    }
    if (typeof availableThemesSetting?.value === "string") {
      return availableThemesSetting.value.split(",").map((v) => v.trim()).filter(Boolean);
    }
    return [];
  }, [availableThemesSetting]);

  const siteTemplateSetting = settings.find((s) => s.key === "site_template");
  const selectedTheme =
    typeof siteTemplateSetting?.value === "string" ? siteTemplateSetting.value : "";

  // --- MODAL HANDLERS ---
  const handleCreate = () => {
    setSelectedSetting(null);
    setIsModalOpen(true);
  };

  const handleEdit = (setting: ISetting) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSetting(null);
    setIsModalOpen(false);
    // ❌ dispatch(fetchSettings()); ÇIKARILDI, çünkü parent merkezi fetch yapıyor
  };

  return (
    <Wrapper>
      <TopBar>
        <Title>{t("title", "Settings")}</Title>
        <AddButton onClick={handleCreate}>
          ➕ {t("addSetting", "Add Setting")}
        </AddButton>
      </TopBar>

      <ThemeManager
  availableThemes={availableThemes}
  selectedTheme={selectedTheme}
  onThemesChange={() => {}} // boş fonksiyon, eğer işlemin yoksa
/>



      {loading && <EmptyMessage>{t("loading", "Loading...")}</EmptyMessage>}
      {error && <EmptyMessage style={{ color: "red" }}>{error}</EmptyMessage>}

      {!Array.isArray(settings) || settings.length === 0 ? (
        <EmptyMessage>{t("noSettings", "No settings found.")}</EmptyMessage>
      ) : (
        <AdminSettingsList
          settings={settings}
          onEdit={handleEdit}
          supportedLocales={SUPPORTED_LOCALES}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
       <AdminSettingsForm
  editingSetting={selectedSetting}
  availableThemes={availableThemes}
  onSave={handleCloseModal}
/>

      </Modal>
    </Wrapper>
  );
}

// --- Styled Components ---

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.lg};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const AddButton = styled.button`
  padding: ${({ theme }) => `${theme.spacings.sm} ${theme.spacings.md}`};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }

  ${({ theme }) => theme.media.small} {
    width: 100%;
    text-align: center;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;
