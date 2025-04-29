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
  const { t } = useTranslation("admin-settings");
  const [newTheme, setNewTheme] = useState("");

  const handleAddTheme = () => {
    const trimmed = newTheme.trim();
    if (!trimmed) return;
    if (availableThemes.includes(trimmed)) {
      setNewTheme(""); // zaten varsa temizle
      return;
    }
    onAddTheme(trimmed);
    setNewTheme(""); // ekledikten sonra temizle
  };

  const handleDelete = (theme: string) => {
    const confirmDelete = window.confirm(
      t("confirmDeleteTheme", `Are you sure you want to delete the theme '${theme}'?`)
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
            <label htmlFor={theme}>{theme}</label>

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
        <AddButton type="button" onClick={handleAddTheme}>
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

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  font-size: 1rem;
  padding: 0;

  &:hover {
    opacity: 0.7;
  }
`;

const AddSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;
