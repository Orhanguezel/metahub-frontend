"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { upsertSetting } from "@/store/settingSlice";
import styled from "styled-components";
import { toast } from "react-toastify";

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
  const [newThemeName, setNewThemeName] = useState("");

  const handleAddTheme = async () => {
    const trimmed = newThemeName.trim();

    if (!trimmed) {
      toast.warning("Theme name cannot be empty.");
      return;
    }

    if (availableThemes.includes(trimmed)) {
      toast.info("Theme already exists.");
      return;
    }

    const updatedThemes = [...availableThemes, trimmed];

    try {
      await dispatch(
        upsertSetting({
          key: "available_themes",
          value: updatedThemes, // ✅ artık array olarak gönderiyoruz
        })
      ).unwrap();

      onAvailableThemesUpdate(updatedThemes);
      toast.success("Theme added successfully.");
      setNewThemeName("");
    } catch (error: any) {
      console.error("❌ Error adding theme:", error);
      toast.error(error?.message || "Failed to add theme.");
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
      <SectionTitle>Available Themes</SectionTitle>

      <ThemeList>
        {(availableThemes || []).map((theme) => (
          <ThemeItem key={theme}>
            <input
              type="radio"
              id={`theme-${theme}`}
              name="theme-selection"
              value={theme}
              checked={currentTheme === theme}
              onChange={() => onThemeChange(theme)}
            />
            <label htmlFor={`theme-${theme}`}>{theme}</label>
          </ThemeItem>
        ))}
      </ThemeList>

      <AddThemeSection>
        <Input
          type="text"
          value={newThemeName}
          onChange={(e) => setNewThemeName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New theme name..."
        />
        <AddButton type="button" onClick={handleAddTheme}>
          ➕ Add
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
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
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

  label {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
  }
`;

const AddThemeSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;
