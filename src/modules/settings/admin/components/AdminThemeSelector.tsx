"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { upsertSetting } from "@/modules/settings/slice/settingSlice";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export interface AdminThemeSelectorProps {
  availableThemes: string[];
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onAvailableThemesUpdate: (newThemes: string[]) => void;
}

export default function AdminThemeSelector({
  availableThemes = [],
  currentTheme,
  onThemeChange,
  onAvailableThemesUpdate,
}: AdminThemeSelectorProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("settings");
  const [newThemeName, setNewThemeName] = useState("");

  const themeExists = (name: string) =>
    availableThemes.some((t) => t.toLowerCase() === name.toLowerCase());

  const handleAddTheme = async () => {
    const trimmed = newThemeName.trim();
    if (!trimmed) {
      toast.warning(t("themeNameEmpty", "Theme name cannot be empty."));
      return;
    }
    if (themeExists(trimmed)) {
      toast.info(t("themeAlreadyExists", "Theme already exists."));
      setNewThemeName("");
      return;
    }

    const updatedThemes = [...availableThemes, trimmed];
    try {
      await dispatch(
        upsertSetting({
          key: "available_themes",
          value: updatedThemes,
        })
      ).unwrap();

      onAvailableThemesUpdate(updatedThemes);
      toast.success(t("themeAdded", "Theme added successfully."));
      setNewThemeName("");
    } catch (error: any) {
      console.error("❌ Error adding theme:", error);
      toast.error(error?.message || t("themeAddError", "Failed to add theme."));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTheme();
    }
  };

  return (
    <Wrapper>
      <SectionTitle>{t("availableThemes", "Available Themes")}</SectionTitle>

      <ThemeList>
        {availableThemes.length === 0 && (
          <NoThemeText>
            ⚠️ {t("noThemes", "No themes available yet.")}
          </NoThemeText>
        )}
        {availableThemes.map((theme) => (
          <ThemeItem key={theme}>
            <Radio
              type="radio"
              id={`theme-${theme}`}
              name="theme-selection"
              value={theme}
              checked={currentTheme === theme}
              onChange={() => onThemeChange(theme)}
            />
            <Label htmlFor={`theme-${theme}`}>{theme}</Label>
          </ThemeItem>
        ))}
      </ThemeList>

      <AddThemeSection>
        <Input
          type="text"
          value={newThemeName}
          onChange={(e) => setNewThemeName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("newThemePlaceholder", "New theme name...")}
        />
        <AddButton
          type="button"
          onClick={handleAddTheme}
          disabled={!newThemeName.trim() || themeExists(newThemeName.trim())}
        >
          ➕ {t("add", "Add")}
        </AddButton>
      </AddThemeSection>
    </Wrapper>
  );
}

// 🎨 Styled Components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThemeItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const NoThemeText = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding-left: 4px;
`;

const Radio = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 16px;
  height: 16px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const AddThemeSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  flex: 1 1 200px;
  min-width: 150px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;
