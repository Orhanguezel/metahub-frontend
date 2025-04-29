"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Setting } from "@/store/settingSlice";
import AdminSettingsList from "./AdminSettingsList";
import AdminSettingsForm from "./AdminSettingsForm";
import Modal from "@/components/shared/Modal";
import styled from "styled-components";

interface AdminSettingsPageProps {
  settings: Setting[];
}

export default function AdminSettingsPage({ settings }: AdminSettingsPageProps) {
  const { t } = useTranslation("admin-settings");

  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  };

  return (
    <Wrapper>
      <TopBar>
        <Title>{t("title", "Settings")}</Title>
        <AddButton onClick={handleCreate}>
          ➕ {t("addSetting", "Add Setting")}
        </AddButton>
      </TopBar>

      {settings.length === 0 ? (
        <EmptyMessage>{t("noSettings", "No settings found.")}</EmptyMessage>
      ) : (
        <AdminSettingsList settings={settings} onEdit={handleEdit} />
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AdminSettingsForm editingSetting={selectedSetting} onSave={handleCloseModal} />
      </Modal>
    </Wrapper>
  );
}

// 🎨 Styled Components (full theme uyumlu!)
const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
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
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;
