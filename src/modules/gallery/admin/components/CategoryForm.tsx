"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createGalleryCategory,
  updateGalleryCategory,
  clearGalleryCategoryMessages,
} from "@/modules/gallery/slice/galleryCategorySlice";
import type { IGalleryCategory } from "@/modules/gallery/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import translations from "../../locales";

const LANGUAGES = SUPPORTED_LOCALES;

interface Props {
  onClose: () => void;
  editingItem?: IGalleryCategory | null;
}

export default function GalleryCategoryForm({ onClose, editingItem }: Props) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { loading, error, successMessage } = useAppSelector(
    (state) => state.galleryCategory
  );

  const emptyLabel = LANGUAGES.reduce(
    (acc, l) => ({ ...acc, [l]: "" }),
    {} as Record<SupportedLocale, string>
  );

  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription({ ...emptyLabel, ...editingItem.description });
      setIsActive(editingItem.isActive ?? true);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
      setIsActive(true);
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledName = { ...name };
    const firstName = Object.values(name).find((v) => v.trim());
    if (firstName) LANGUAGES.forEach((l) => { if (!filledName[l]) filledName[l] = firstName; });

    const filledDesc = { ...description };
    const firstDesc = Object.values(description).find((v) => v.trim());
    if (firstDesc) LANGUAGES.forEach((l) => { if (!filledDesc[l]) filledDesc[l] = firstDesc; });

    const data = {
      name: filledName,
      description: filledDesc,
      isActive,
    };

    if (editingItem?._id) {
      await dispatch(updateGalleryCategory({ id: editingItem._id, data })).unwrap();
    } else {
      await dispatch(createGalleryCategory(data)).unwrap();
    }

    dispatch(clearGalleryCategoryMessages());
    onClose();
  };

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.gallerycategory.edit", "Edit Gallery Category")
          : t("admin.gallerycategory.create", "Add New Gallery Category")}
      </h2>
      <form onSubmit={handleSubmit}>
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label>{t("admin.gallerycategory.name", "Name")} ({lng.toUpperCase()})</label>
            <input
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === lang}
            />
            <label>{t("admin.gallerycategory.description", "Description")} ({lng.toUpperCase()})</label>
            <textarea
              value={description[lng]}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              required={lng === lang}
            />
          </div>
        ))}

        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />{" "}
          {t("admin.gallerycategory.isActive", "Active")}
        </label>

        {error && <ErrorMessage>❌ {error}</ErrorMessage>}
        {successMessage && <SuccessMessage>✅ {successMessage}</SuccessMessage>}

        <ButtonGroup>
          <button type="submit" disabled={loading}>
            {loading
              ? t("admin.saving", "Saving...")
              : editingItem
              ? t("admin.update", "Update")
              : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}

const FormWrapper = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  h2 {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:first-child {
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.danger};
      color: #fff;
    }

    &:hover {
      opacity: 0.9;
    }
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 0.9rem;
`;
