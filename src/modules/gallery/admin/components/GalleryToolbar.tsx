"use client";

import React, { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchGalleryItems } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const GalleryToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.gallery);
  const { t } = useTranslation("gallery");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Arama gönder
  const handleSearch = () => {
    dispatch(searchGalleryItems({ search: search.trim() }));
    inputRef.current?.blur();
  };

  // Enter tuşu ile arama
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // Arama kutusunu temizle
  const clearSearch = () => {
    setSearch("");
    dispatch(searchGalleryItems({ search: "" }));
    inputRef.current?.focus();
  };

  return (
    <Toolbar>
      <Input
        ref={inputRef}
        type="text"
        aria-label={t("toolbar.searchPlaceholder")}
        placeholder={t("toolbar.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoComplete="off"
      />
      <Button type="button" onClick={handleSearch} disabled={loading || search.trim() === ""}>
        {t("toolbar.searchButton")}
      </Button>
      <ClearButton
        type="button"
        onClick={clearSearch}
        disabled={loading || search === ""}
        style={{ display: search ? "block" : "none" }}
        aria-label={t("toolbar.clearButton")}
      >
        {t("toolbar.clearButton")}
      </ClearButton>
    </Toolbar>
  );
};

export default GalleryToolbar;

// Styled Components


const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  transition: box-shadow ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const Input = styled.input`
  flex: 1 1 180px;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  transition: border ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    outline: none;
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal}, color ${({ theme }) => theme.transition.normal}, box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ClearButton = styled(Button)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  margin-left: 0;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

export {
  Toolbar,
  Input,
  Button,
  ClearButton,
};
