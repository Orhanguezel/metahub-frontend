// src/modules/settings/admin/pages/AdminSettingsPage.tsx

"use client";

import React, { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchSettings,
  Setting,
} from "@/modules/settings/slice/settingSlice";
import { AdminSettingsList, AdminSettingsForm } from "@/modules/settings";
import { Modal } from "@/shared";
import styled from "styled-components";

export default function AdminSettingsPage() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.setting);

  // İlk yüklemede ayarları çek
  useEffect(() => {
    if (!settings || settings.length === 0) {
      dispatch(fetchSettings());
    }
  }, [dispatch, settings]);

  // Modal ve seçili ayar state
  const [selectedSetting, setSelectedSetting] = React.useState<Setting | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Her zaman güncel availableThemes hesaplama
  const availableThemesSetting = settings.find((s) => s.key === "available_themes");
  const getAvailableThemes = useCallback((): string[] => {
    if (Array.isArray(availableThemesSetting?.value)) {
      return availableThemesSetting.value as string[];
    }
    if (typeof availableThemesSetting?.value === "string") {
      return availableThemesSetting.value.split(",").map((v) => v.trim());
    }
    return [];
  }, [availableThemesSetting]);

  // Modal Açma-Kapama
  const handleCreate = () => {
    setSelectedSetting(null);
    setIsModalOpen(true);
  };

  const handleEdit = (setting: Setting) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSetting(null);
    setIsModalOpen(false);
    // Modal kapandıktan sonra ayarları tazele
    setTimeout(() => dispatch(fetchSettings()), 500);
  };

  return (
    <Wrapper>
      <TopBar>
        <Title>{t("title", "Settings")}</Title>
        <AddButton onClick={handleCreate}>
          ➕ {t("addSetting", "Add Setting")}
        </AddButton>
      </TopBar>

      {loading && <EmptyMessage>{t("loading", "Loading...")}</EmptyMessage>}
      {error && <EmptyMessage style={{ color: "red" }}>{error}</EmptyMessage>}

      {!Array.isArray(settings) || settings.length === 0 ? (
        <EmptyMessage>{t("noSettings", "No settings found.")}</EmptyMessage>
      ) : (
        <AdminSettingsList settings={settings} onEdit={handleEdit} />
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AdminSettingsForm
          editingSetting={selectedSetting}
          availableThemes={getAvailableThemes()}
          onAvailableThemesUpdate={() => dispatch(fetchSettings())}
          onSave={handleCloseModal}
        />
      </Modal>
    </Wrapper>
  );
}

// 🎨 Styled Components
const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
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
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
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
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;
