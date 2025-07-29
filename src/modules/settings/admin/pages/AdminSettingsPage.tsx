"use client";

import React, { useState, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppSelector } from "@/store/hooks";
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
  const { t } = useI18nNamespace("settings", translations);
  // --- Sadece admin slice!
  const settings = useAppSelector((state) => state.settings.settingsAdmin);
  const loading = useAppSelector((state) => state.settings.loading);
  const error = useAppSelector((state) => state.settings.error);

  const [selectedSetting, setSelectedSetting] = useState<ISetting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // THEMES (Backend ile birebir)
  const availableThemesSetting = settings.find((s) => s.key === "available_themes");
  const availableThemes = useMemo(() => {
    if (Array.isArray(availableThemesSetting?.value)) {
      return availableThemesSetting.value as string[];
    }
    if (typeof availableThemesSetting?.value === "string") {
      return availableThemesSetting.value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  }, [availableThemesSetting]);

  const siteTemplateSetting = settings.find((s) => s.key === "site_template");
  const selectedTheme =
    typeof siteTemplateSetting?.value === "string"
      ? siteTemplateSetting.value
      : Array.isArray(siteTemplateSetting?.value) && siteTemplateSetting.value.length > 0
      ? siteTemplateSetting.value[0]
      : "";

  // MODAL HANDLERS
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
    // Ekstra fetch gerekmiyor, redux store otomatik güncellenir.
  };

  return (
    <Wrapper>
      <TopBar>
        <Title>{t("title", "Settings")}</Title>
        <AddButton onClick={handleCreate}>
          ➕ {t("addSetting", "Add Setting")}
        </AddButton>
      </TopBar>

      {/* TEMA YÖNETİCİ */}
      <ThemeManager
        availableThemes={availableThemes}
        selectedTheme={selectedTheme}
        onThemesChange={() => {}} // Fetch'e gerek yok, prop olarak güncelleniyor.
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

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.sectionBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};

  ${({ theme }) => theme.media.medium} {
    padding: ${({ theme }) => theme.spacings.lg};
    gap: ${({ theme }) => theme.spacings.lg};
    border-radius: ${({ theme }) => theme.radii.md};
  }
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md};
    gap: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
  ${({ theme }) => theme.media.xsmall} {
    padding: ${({ theme }) => theme.spacings.sm};
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.xs};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-bottom: 0;

  ${({ theme }) => theme.media.medium} {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const AddButton = styled.button`
  padding: ${({ theme }) => `${theme.spacings.sm} ${theme.spacings.xl}`};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    outline: none;
  }
  &:active {
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  ${({ theme }) => theme.media.small} {
    width: 100%;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => `${theme.spacings.sm} ${theme.spacings.md}`};
    margin-top: ${({ theme }) => theme.spacings.xs};
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  padding: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin: ${({ theme }) => theme.spacings.lg} auto;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  ${({ theme }) => theme.media.medium} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
  }
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    margin: ${({ theme }) => theme.spacings.sm} auto;
  }
`;
