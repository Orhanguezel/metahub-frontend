"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { upsertSetting } from "@/modules/settings/slice/settingSlice";
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
  const { t } = useTranslation("settings");
  const [newTheme, setNewTheme] = useState("");

  // Yardımcı: theme adı normalize (küçük harf, boşluk kırpma)
  const normalizeTheme = (theme: string) => theme.trim().toLowerCase();

  const handleAddTheme = async () => {
    const trimmed = normalizeTheme(newTheme);
    if (!trimmed) {
      toast.error(t("themeNameRequired", "Theme name cannot be empty."));
      return;
    }
    if (availableThemes.map(normalizeTheme).includes(trimmed)) {
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
    const updatedThemes = availableThemes.filter(
      (theme) => normalizeTheme(theme) !== normalizeTheme(themeToDelete)
    );
    try {
      await dispatch(
        upsertSetting({ key: "available_themes", value: updatedThemes })
      ).unwrap();
      onThemesChange(updatedThemes);
      toast.success(t("themeDeleted", "Theme deleted successfully."));
    } catch (error: any) {
      console.error("❌ Delete Theme Error:", error);
      toast.error(
        error?.message || t("deleteThemeError", "Failed to delete theme.")
      );
    }
  };

  return (
    <Wrapper>
      <ThemeList>
        {availableThemes.length > 0 ? (
          availableThemes.map((theme) => (
            <ThemeItem key={theme}>
              <ThemeName>{theme}</ThemeName>
              <DeleteButton
                type="button"
                onClick={() => handleDeleteTheme(theme)}
                title={t("delete", "Delete")}
              >
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTheme();
            }
          }}
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
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ThemeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ThemeName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const NoThemes = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1 1 200px;
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;
