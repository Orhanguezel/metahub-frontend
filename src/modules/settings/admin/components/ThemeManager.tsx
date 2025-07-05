"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { upsertSettings } from "@/modules/settings/slice/settingsSlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface ThemeManagerProps {
  availableThemes?: string[];
  selectedTheme?: string;
  onThemesChange: (themes: string[]) => void;
  onSelectedThemeChange?: (theme: string) => void;
}

/**
 * ThemeManager
 * - Array olarak tema ekler/siler, virgülle çoklu ekleme destekler.
 * - Seçili tema değiştirilirse "site_template" olarak backend'e kaydeder.
 */
const ThemeManager: React.FC<ThemeManagerProps> = ({
  availableThemes = [],
  selectedTheme = "",
  onThemesChange,
  onSelectedThemeChange,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("settings", translations);
  const [newThemes, setNewThemes] = useState<string>("");

  // Küçük harfe normalize
  const normalize = (str: string) => str.trim().toLowerCase();

  // Tema ekle (virgül ile birden fazla destekler)
  const handleAddThemes = async () => {
    const splitted = newThemes
      .split(",")
      .map((th) => th.trim())
      .filter(Boolean);

    if (splitted.length === 0) {
      toast.error(t("themeNameRequired", "Theme name cannot be empty."));
      return;
    }

    // Var olanları çıkar, yenileri ekle
    const current = availableThemes.map(normalize);
    const uniqueNew = splitted.filter((th) => !current.includes(normalize(th)));
    if (uniqueNew.length === 0) {
      toast.info(t("themeAlreadyExists", "Theme(s) already exist."));
      setNewThemes("");
      return;
    }

    const updatedThemes = [...availableThemes, ...uniqueNew];

    try {
      await dispatch(
        upsertSettings({ key: "available_themes", value: updatedThemes })
      ).unwrap();
      onThemesChange(updatedThemes);
      toast.success(t("themeAdded", "Theme(s) added successfully."));
      setNewThemes("");
    } catch (error: any) {
      toast.error(
        error?.message || t("addThemeError", "Failed to add theme(s).")
      );
    }
  };

  // Tema sil
  const handleDeleteTheme = async (themeToDelete: string) => {
    const updatedThemes = availableThemes.filter(
      (theme) => normalize(theme) !== normalize(themeToDelete)
    );
    try {
      await dispatch(
        upsertSettings({ key: "available_themes", value: updatedThemes })
      ).unwrap();
      onThemesChange(updatedThemes);
      toast.success(t("themeDeleted", "Theme deleted successfully."));

      // Eğer silinen tema seçiliyse, site_template boşlanmalı!
      if (selectedTheme === themeToDelete) {
        await dispatch(
          upsertSettings({ key: "site_template", value: "" })
        ).unwrap();
        if (onSelectedThemeChange) onSelectedThemeChange("");
      }
    } catch (error: any) {
      toast.error(
        error?.message || t("deleteThemeError", "Failed to delete theme.")
      );
    }
  };

  // Tema seç
  const handleSelectTheme = async (theme: string) => {
    try {
      await dispatch(
        upsertSettings({ key: "site_template", value: theme })
      ).unwrap();
      if (onSelectedThemeChange) onSelectedThemeChange(theme);
      toast.success(t("themeSelected", "Theme selected successfully."));
    } catch (error: any) {
      toast.error(
        error?.message || t("selectThemeError", "Failed to select theme.")
      );
    }
  };

  return (
    <Wrapper>
      <SectionTitle>{t("availableThemes", "Available Themes")}</SectionTitle>
      <ThemeList>
        {availableThemes.length > 0 ? (
          availableThemes.map((theme) => (
            <ThemeItem key={theme}>
              <Radio
                type="radio"
                id={`theme-${theme}`}
                name="theme-selection"
                value={theme}
                checked={selectedTheme === theme}
                onChange={() => handleSelectTheme(theme)}
              />
              <ThemeName htmlFor={`theme-${theme}`}>{theme}</ThemeName>
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
          placeholder={t(
            "enterNewTheme",
            "Enter new theme(s), comma separated..."
          )}
          value={newThemes}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewThemes(e.target.value)
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddThemes();
            }
          }}
        />
        <AddButton type="button" onClick={handleAddThemes}>
          ➕ {t("addTheme", "Add Theme(s)")}
        </AddButton>
      </AddSection>
    </Wrapper>
  );
};

export default ThemeManager;

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const ThemeItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const Radio = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 16px;
  height: 16px;
`;

const ThemeName = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  flex: 1;
`;

const NoThemes = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Input = styled.input`
  flex: 1 1 200px;
  padding: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
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
