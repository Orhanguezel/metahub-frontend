"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface AdminSiteTemplateSelectorProps {
  availableThemes: string[];
  selectedTheme: string;
  onChange: (value: string) => void;
  onAddTheme: (newTheme: string) => void;
  onDeleteTheme?: (theme: string) => void;
}

export default function AdminSiteTemplateSelector({
  availableThemes,
  selectedTheme,
  onChange,
  onAddTheme,
  onDeleteTheme,
}: AdminSiteTemplateSelectorProps) {
  const { t } = useTranslation("settings");
  const [newTheme, setNewTheme] = useState("");

  // Tema ekleme fonksiyonu
  const handleAddTheme = () => {
    const trimmed = newTheme.trim();
    if (!trimmed) return;
    if (
      availableThemes.some((th) => th.toLowerCase() === trimmed.toLowerCase())
    ) {
      setNewTheme("");
      return;
    }
    onAddTheme(trimmed);
    setNewTheme("");
  };

  // Tema silme fonksiyonu
  const handleDelete = (theme: string) => {
    const confirmDelete = window.confirm(
      t(
        "confirmDeleteTheme",
        `Are you sure you want to delete the theme '${theme}'?`
      )
    );
    if (confirmDelete && onDeleteTheme) {
      onDeleteTheme(theme);
    }
  };

  return (
    <Wrapper>
      <RadioGroup>
        {availableThemes.map((theme) => (
          <RadioItem key={theme}>
            <input
              type="radio"
              id={theme}
              name="site_template"
              value={theme}
              checked={selectedTheme === theme}
              onChange={() => onChange(theme)}
            />
            <ThemeLabel htmlFor={theme}>{theme}</ThemeLabel>
            {onDeleteTheme && (
              <DeleteButton
                type="button"
                title={t("deleteTheme", "Delete this theme")}
                onClick={() => handleDelete(theme)}
              >
                ❌
              </DeleteButton>
            )}
          </RadioItem>
        ))}
      </RadioGroup>

      <AddSection>
        <Input
          type="text"
          value={newTheme}
          placeholder={t("addNewTheme", "Enter new theme")}
          onChange={(e) => setNewTheme(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTheme();
            }
          }}
        />
        <AddButton
          type="button"
          onClick={handleAddTheme}
          disabled={!newTheme.trim()}
        >
          ➕ {t("add", "Add")}
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
  width: 100%;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const ThemeLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  flex: 1;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

const AddSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1;
  min-width: 150px;
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
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
