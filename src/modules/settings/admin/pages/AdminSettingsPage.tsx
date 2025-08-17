"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppSelector } from "@/store/hooks";
import {
  AdminSettingsList,
  AdminSettingsForm,
  ThemeManager,
} from "@/modules/settings";
import Modal from "@/shared/Modal";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { ISetting } from "@/modules/settings/types";

export default function AdminSettingsPage() {
  const { t } = useI18nNamespace("settings", translations);

  // --- sadece admin slice ---
  const settings = useAppSelector((s) => s.settings.settingsAdmin);
  const loading  = useAppSelector((s) => s.settings.loading);
  const error    = useAppSelector((s) => s.settings.error);

  const [selectedSetting, setSelectedSetting] = useState<ISetting | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);

  // THEMES (backend ile birebir)
  const availableThemesSetting = settings.find((s) => s.key === "available_themes");
  const availableThemes = useMemo<string[]>(() => {
    if (Array.isArray(availableThemesSetting?.value)) return availableThemesSetting?.value as string[];
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

  const count = settings?.length ?? 0;

  // MODAL
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
  };

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("title", "Settings")}</h1>
          <Subtitle>
            {t("subtitle", "Manage site-wide configuration, themes and flags.")}
          </Subtitle>
        </TitleBlock>

        <Right>
          <Counter aria-label="settings-count">{count}</Counter>
          <PrimaryBtn onClick={handleCreate}>+ {t("addSetting", "Add Setting")}</PrimaryBtn>
        </Right>
      </Header>

      {/* === Theme Manager === */}
      <Section>
        <SectionHead>
          <h2>{t("themeManager.title", "Themes")}</h2>
        </SectionHead>
        <Card>
          <ThemeManager
            availableThemes={availableThemes}
            selectedTheme={selectedTheme}
            onThemesChange={() => {}} // store güncellemeleri zaten tetikleniyor
          />
        </Card>
      </Section>

      {/* === Settings List === */}
      <Section>
        <SectionHead>
          <h2>{t("list.title", "All Settings")}</h2>
        </SectionHead>
        <Card>
          {loading && <EmptyBox>{t("loading", "Loading...")}</EmptyBox>}
          {error && !loading && <EmptyBox $danger>{error}</EmptyBox>}

          {!loading && !error && (!Array.isArray(settings) || settings.length === 0) ? (
            <EmptyBox>{t("noSettings", "No settings found.")}</EmptyBox>
          ) : (
            <AdminSettingsList
              settings={settings}
              onEdit={handleEdit}
              supportedLocales={SUPPORTED_LOCALES}
            />
          )}
        </Card>
      </Section>

      {/* === Modal (Create / Edit) === */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AdminSettingsForm
          editingSetting={selectedSetting}
          availableThemes={availableThemes}
          onSave={handleCloseModal}
        />
      </Modal>
    </PageWrap>
  );
}

/* ===================== styles (aynı patern) ===================== */

const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.title};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};

    ${({ theme }) => theme.media.medium} {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
    ${({ theme }) => theme.media.small} {
      font-size: ${({ theme }) => theme.fontSizes.lg};
    }
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover { filter: brightness(0.98); }
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.md};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.title};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const EmptyBox = styled.p<{ $danger?: boolean }>`
  text-align: center;
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  margin: 0;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.textSecondary)};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ $danger, theme }) =>
    $danger ? `${theme.borders.thin} ${theme.colors.danger}` : `${theme.borders.thin} ${theme.colors.borderBright}`};
`;
