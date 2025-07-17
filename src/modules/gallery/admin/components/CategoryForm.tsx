"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import type { IGalleryCategory } from "@/modules/gallery/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IGalleryCategory | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const EMPTY_LABEL: Record<SupportedLocale, string> = SUPPORTED_LOCALES.reduce(
  (acc, lng) => ({ ...acc, [lng]: "" }),
  {} as Record<SupportedLocale, string>
);

export default function GalleryCategoryFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { t } = useI18nNamespace("gallery", translations);

  // --- State
  const [name, setName] = useState<Record<SupportedLocale, string>>(EMPTY_LABEL);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(EMPTY_LABEL);

  // --- Gallery gibi tam pattern ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // --- Edit Mode Fill ---
  useEffect(() => {
    if (editingItem) {
      setName({ ...EMPTY_LABEL, ...editingItem.name });
      setDescription({ ...EMPTY_LABEL, ...editingItem.description });
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setName(EMPTY_LABEL);
      setDescription(EMPTY_LABEL);
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // --- ImageUpload Pattern ---
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current); // preview
    },
    []
  );

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Doldurulan dilleri gallery gibi otomatik doldur
    const filledName = { ...name };
    const firstNameValue = Object.values(name).find((v) => v.trim());
    if (firstNameValue) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledName[lng]) filledName[lng] = firstNameValue;
      });
    }
    const filledDesc = { ...description };
    const firstDescValue = Object.values(description).find((v) => v.trim());
    if (firstDescValue) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDesc[lng]) filledDesc[lng] = firstDescValue;
      });
    }

    // En az bir isim (tüm dillerde doldurulmuş olacak)
    if (!Object.values(filledName).some((v) => v.trim())) {
      toast.error(t("admin.gallerycategory.name_required", "Category name is required."));
      return;
    }

    // --- Gallery pattern: dosya eklemesiz submit kabul edilsin mi? Zorunlu yapmak istersen şunu aç:
    // if (selectedFiles.length === 0 && existingImages.length === 0) {
    //   toast.error(t("admin.gallerycategory.images_required", "At least one image required."));
    //   return;
    // }

    // --- FormData ---
    const formData = new FormData();
    formData.append("name", JSON.stringify(filledName));
    formData.append("description", JSON.stringify(filledDesc));
    selectedFiles.forEach((file) => {
      formData.append("images", file); // **ÇOK ÖNEMLİ:** field adı "images" olmalı!
    });
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    try {
      await onSubmit(formData, editingItem?._id);
      onClose();
    } catch {
      toast.error(
        t("admin.gallerycategory.submit_error", "Error submitting category.")
      );
    }
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.gallerycategory.edit", "Edit Gallery Category")
          : t("admin.gallerycategory.create", "Add New Gallery Category")}
      </h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`name-${lng}`}>
              {t("admin.gallerycategory.name", "Category Name")} ({lng.toUpperCase()})
            </label>
            <input
              id={`name-${lng}`}
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              autoComplete="off"
            />
            <label htmlFor={`desc-${lng}`}>
              {t("admin.gallerycategory.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={description[lng]}
              onChange={(e) =>
                setDescription({ ...description, [lng]: e.target.value })
              }
              autoComplete="off"
            />
          </div>
        ))}

        <label>{t("admin.gallerycategory.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          folder="galleryCategory"
          defaultImages={existingImages}
          onChange={handleImagesChange}
        />

        <ButtonGroup>
          <button type="submit">
            {editingItem
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

// --- Styles (gallery ile uyumlu) ---
const FormWrapper = styled.div`
  max-width: 600px;
  width: 100%;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  max-height: 80vh;
  overflow-y: auto;
  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 95vw;
  }
  h2 {
    margin-bottom: 1rem;
  }
  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  input,
  textarea,
  select {
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
