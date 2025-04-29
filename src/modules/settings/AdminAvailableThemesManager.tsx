"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { upsertSetting } from "@/store/settingSlice";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface AdminAvailableThemesManagerProps {
  availableThemes: string[];
  onThemesChange: (newThemes: string[]) => void;
}

export default function AdminAvailableThemesManager({
  availableThemes,
  onThemesChange,
}: AdminAvailableThemesManagerProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("admin-settings");
  const [newTheme, setNewTheme] = useState("");

  const handleAddTheme = async () => {
    const trimmed = newTheme.trim();
    if (!trimmed) {
      toast.error(t("themeNameRequired", "Theme name cannot be empty."));
      return;
    }
    if (availableThemes.includes(trimmed)) {
      toast.error(t("themeAlreadyExists", "This theme already exists."));
      return;
    }

    const updatedThemes = [...availableThemes, trimmed];

    try {
      await dispatch(
        upsertSetting({ key: "available_themes", value: updatedThemes })
      ).unwrap();
      onThemesChange(updatedThemes);
      toast.success(t("themeAdded", "Theme added successfully."));
      setNewTheme("");
    } catch (error: any) {
      console.error("❌ Add Theme Error:", error);
      toast.error(error?.message || t("addThemeError", "Failed to add theme."));
    }
  };

  const handleDeleteTheme = async (themeToDelete: string) => {
    const updatedThemes = availableThemes.filter((theme) => theme !== themeToDelete);

    try {
      await dispatch(
        upsertSetting({ key: "available_themes", value: updatedThemes })
      ).unwrap();
      onThemesChange(updatedThemes);
      toast.success(t("themeDeleted", "Theme deleted successfully."));
    } catch (error: any) {
      console.error("❌ Delete Theme Error:", error);
      toast.error(error?.message || t("deleteThemeError", "Failed to delete theme."));
    }
  };

  return (
    <Wrapper>
      <ThemeList>
        {availableThemes.length > 0 ? (
          availableThemes.map((theme) => (
            <ThemeItem key={theme}>
              {theme}
              <DeleteButton type="button" onClick={() => handleDeleteTheme(theme)}>
                ❌
              </DeleteButton>
            </ThemeItem>
          ))
        ) : (
          <NoThemes>⚠️ {t("noThemes", "No themes available yet.")}</NoThemes>
        )}
      </ThemeList>

      <AddSection>
        <Input
          type="text"
          placeholder={t("enterNewTheme", "Enter new theme...")}
          value={newTheme}
          onChange={(e) => setNewTheme(e.target.value)}
        />
        <AddButton type="button" onClick={handleAddTheme}>
          ➕ {t("addTheme", "Add Theme")}
        </AddButton>
      </AddSection>
    </Wrapper>
  );
}

// 🎨 Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThemeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const NoThemes = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: 18px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;