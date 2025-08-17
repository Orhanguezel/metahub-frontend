"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { upsertSettings, fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface ThemeManagerProps {
  availableThemes?: string[];
  selectedTheme?: string;
  onThemesChange: (themes: string[]) => void;
  onSelectedThemeChange?: (theme: string) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({
  availableThemes = [],
  selectedTheme = "",
  onThemesChange,
  onSelectedThemeChange,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("settings", translations);
  const [newThemes, setNewThemes] = useState<string>("");

  const normalize = (s: string) => s.trim().toLowerCase();

  const handleAddThemes = async () => {
    const splitted = newThemes.split(",").map((th) => th.trim()).filter(Boolean);
    if (!splitted.length) {
      toast.error(t("themeNameRequired", "Theme name cannot be empty."));
      return;
    }
    const current = availableThemes.map(normalize);
    const uniqueNew = splitted.filter((th) => !current.includes(normalize(th)));
    if (!uniqueNew.length) {
      toast.info(t("themeAlreadyExists", "Theme(s) already exist."));
      setNewThemes("");
      return;
    }
    const updatedThemes = [...availableThemes, ...uniqueNew];
    try {
      await dispatch(upsertSettings({ key: "available_themes", value: updatedThemes, isActive: true })).unwrap();
      onThemesChange(updatedThemes);
      await dispatch(fetchSettings());
      toast.success(t("themeAdded", "Theme(s) added successfully."));
      setNewThemes("");
    } catch (err: any) {
      toast.error(err?.message || t("addThemeError", "Failed to add theme(s)."));
    }
  };

  const handleDeleteTheme = async (themeToDelete: string) => {
    const updatedThemes = availableThemes.filter((th) => normalize(th) !== normalize(themeToDelete));
    try {
      await dispatch(upsertSettings({ key: "available_themes", value: updatedThemes, isActive: true })).unwrap();
      onThemesChange(updatedThemes);
      await dispatch(fetchSettings());
      toast.success(t("themeDeleted", "Theme deleted successfully."));
      if (selectedTheme === themeToDelete) {
        await dispatch(upsertSettings({ key: "site_template", value: "", isActive: true })).unwrap();
        onSelectedThemeChange?.("");
        await dispatch(fetchSettings());
      }
    } catch (err: any) {
      toast.error(err?.message || t("deleteThemeError", "Failed to delete theme."));
    }
  };

  const handleSelectTheme = async (theme: string) => {
    if (!theme) {
      toast.error(t("selectThemeError", "Please select a valid theme."));
      return;
    }
    try {
      await dispatch(upsertSettings({ key: "site_template", value: theme, isActive: true })).unwrap();
      onSelectedThemeChange?.(theme);
      await dispatch(fetchSettings());
      toast.success(t("themeSelected", "Theme selected successfully."));
    } catch (err: any) {
      toast.error(err?.message || t("selectThemeError", "Failed to select theme."));
    }
  };

  return (
    <Wrap>
      <Title>{t("availableThemes", "Available Themes")}</Title>

      <List>
        {availableThemes.length ? (
          availableThemes.map((theme) => (
            <Item key={theme}>
              <input
                type="radio"
                id={`theme-${theme}`}
                name="theme-selection"
                value={theme}
                checked={selectedTheme === theme}
                onChange={() => handleSelectTheme(theme)}
              />
              <Label htmlFor={`theme-${theme}`}>{theme}</Label>
              <DeleteBtn type="button" onClick={() => handleDeleteTheme(theme)} title={t("delete", "Delete")}>
                ❌
              </DeleteBtn>
            </Item>
          ))
        ) : (
          <Empty>⚠️ {t("noThemes", "No themes available yet.")}</Empty>
        )}
      </List>

      <AddRow>
        <Input
          type="text"
          placeholder={t("enterNewTheme", "Enter new theme(s), comma separated...")}
          value={newThemes}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewThemes(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddThemes();
            }
          }}
        />
        <Primary onClick={handleAddThemes}>+ {t("addTheme", "Add Theme(s)")}</Primary>
      </AddRow>
    </Wrap>
  );
};

export default ThemeManager;

/* ================= styles (ortak kart/panel patern) ================= */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.title};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};

  input[type="radio"] {
    accent-color: ${({ theme }) => theme.colors.primary};
    width: 16px;
    height: 16px;
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  flex: 1;
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Input = styled.input`
  flex: 1 1 220px;
  padding: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  min-width: 220px;
`;

const Primary = styled.button`
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: filter .15s;
  &:hover { filter: brightness(0.98); }
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
`;
