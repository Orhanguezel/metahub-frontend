"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createGalleryCategory,
  updateGalleryCategory,
  clearCategoryMessages,
} from "@/modules/gallery/slice/galleryCategorySlice";
import type { GalleryCategory } from "@/modules/gallery/types/gallery";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
  editingItem?: GalleryCategory | null;
}

export default function GalleryCategoryForm({ onClose, editingItem }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("gallery");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.galleryCategory
  );

  const [name, setName] = useState({ tr: "", en: "", de: "" });
  const [description, setDescription] = useState("");

  const languages = useMemo(() => ["tr", "en", "de"] as const, []);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || { tr: "", en: "", de: "" });
      setDescription(editingItem.description || "");
    } else {
      setName({ tr: "", en: "", de: "" });
      setDescription("");
    }
  }, [editingItem]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearCategoryMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = useCallback(
    (lang: "tr" | "en" | "de", value: string) => {
      setName((prev) => ({ ...prev, [lang]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };

    try {
      if (editingItem?._id) {
        await dispatch(
          updateGalleryCategory({ id: editingItem._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createGalleryCategory(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("❌ Category operation failed:", err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>
        {editingItem
          ? t("admin.edit_category", "Edit Category")
          : t("admin.new_category", "New Category")}
      </FormTitle>

      {languages.map((lng) => (
        <FieldGroup key={lng}>
          <StyledLabel htmlFor={`name-${lng}`}>{lng.toUpperCase()}</StyledLabel>
          <StyledInput
            id={`name-${lng}`}
            type="text"
            value={name[lng]}
            onChange={(e) => handleChange(lng, e.target.value)}
            placeholder={t("admin.category_name_placeholder", {
              lng: lng.toUpperCase(),
            })}
            required
          />
        </FieldGroup>
      ))}

      <FieldGroup>
        <StyledLabel htmlFor="desc">
          {t("admin.description_optional", "Description (optional)")}
        </StyledLabel>
        <StyledTextarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t(
            "admin.category_description_placeholder",
            "What is this category gallery?"
          )}
        />
      </FieldGroup>

      {error && <ErrorText>❌ {error}</ErrorText>}
      {successMessage && <SuccessText>✅ {successMessage}</SuccessText>}

      <SubmitButton type="submit" disabled={loading}>
        {loading
          ? t("admin.loading", "Saving...")
          : editingItem
          ? t("admin.update", "Update")
          : t("admin.create", "Create")}
      </SubmitButton>
    </Form>
  );
}

// 💅 STYLES %100 ANASTASIA THEME UYUMLU

const Form = styled.form`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    max-width: 100%;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const FormTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.02em;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StyledLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StyledInput = styled.input`
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  transition: border ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.inputs.borderFocus};
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.form};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;

const StyledTextarea = styled.textarea`
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-height: 90px;
  resize: vertical;
  transition: border ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.inputs.borderFocus};
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.form};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.opacity.disabled};
    box-shadow: none;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.body};
`;
