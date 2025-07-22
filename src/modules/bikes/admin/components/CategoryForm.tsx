"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import type { BikesCategory } from "@/modules/bikes/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/bikes";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

const LANGUAGES = SUPPORTED_LOCALES;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: BikesCategory | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function BikesCategoryFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { i18n, t } = useI18nNamespace("bikes", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Çoklu dil için boş state
  const emptyLabel = SUPPORTED_LOCALES.reduce(
    (acc, lng) => ({ ...acc, [lng]: "" }),
    {} as Record<SupportedLocale, string>
  );

  // Controlled State
  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Düzenleme modunda (edit) inputları doldur
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription({ ...emptyLabel, ...editingItem.description });
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setIsActive(editingItem.isActive ?? true);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setName({ ...emptyLabel }); // referans sıfırlama!
      setDescription({ ...emptyLabel });
      setExistingImages([]);
      setIsActive(true);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
    // eslint-disable-next-line
  }, [editingItem, isOpen]);

  // Görsel değişikliği
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Oto-doldurma (en az bir dilde girilmiş ise tüm dillere uygula)
    const filledName = { ...name };
    const firstName = Object.values(name).find((v) => v.trim());
    if (firstName)
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledName[lng]) filledName[lng] = firstName;
      });

    const filledDesc = { ...description };
    const firstDesc = Object.values(description).find((v) => v.trim());
    if (firstDesc)
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDesc[lng]) filledDesc[lng] = firstDesc;
      });

    const formData = new FormData();
    formData.append("name", JSON.stringify(filledName));
    formData.append("description", JSON.stringify(filledDesc));
    formData.append("isActive", String(isActive));
    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    await onSubmit(formData, editingItem?._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.bikecategory.edit", "Edit Bike Category")
          : t("admin.bikecategory.create", "Add New Bike Category")}
      </h2>
      <form onSubmit={handleSubmit}>
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`name-${lng}`}>
              {t("admin.bikecategory.name", "Category Name")} ({lng.toUpperCase()})
            </label>
            <input
              id={`name-${lng}`}
              type="text"
              value={name[lng] || ""}
              autoComplete="off"
              onChange={(e) =>
                setName((prev) => ({ ...prev, [lng]: e.target.value }))
              }
              required={lng === lang}
            />

            <label htmlFor={`desc-${lng}`}>
              {t("admin.bikecategory.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={description[lng] || ""}
              autoComplete="off"
              onChange={(e) =>
                setDescription((prev) => ({ ...prev, [lng]: e.target.value }))
              }
              required={lng === lang}
            />
          </div>
        ))}

        <label>{t("admin.bikecategory.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="bikesCategory"
        />

        <label style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive((prev) => !prev)}
          />
          {" "}
          {t("admin.bikecategory.isActive", "Category Active")}
        </label>

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
