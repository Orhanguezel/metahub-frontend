"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchGalleryItems } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const GalleryToolbar = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.gallery);
  const { t } = useTranslation("gallery");
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim() !== "") {
      dispatch(searchGalleryItems({ search }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearch("");
    dispatch(searchGalleryItems({ search: "" }));
  };

  return (
    <Toolbar>
      <Input
        type="text"
        placeholder={t("toolbar.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button onClick={handleSearch} disabled={loading}>
        {t("toolbar.searchButton")}
      </Button>
      {search && (
        <ClearButton onClick={clearSearch} disabled={loading}>
          {t("toolbar.clearButton")}
        </ClearButton>
      )}
    </Toolbar>
  );
};

export default GalleryToolbar;

// 🎨 styled-components
const Toolbar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const ClearButton = styled(Button)`
  background: ${({ theme }) => theme.colors.danger};
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
  }
`;
