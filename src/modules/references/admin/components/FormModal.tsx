"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/references";
import { ReferencesCategory, IReferences } from "@/modules/references/types";
import { ImageUploadWithPreview } from "@/shared";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IReferences | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function FormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  // DİL ve ÇEVİRİ
  const { i18n, t } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Selector
  const categories = useAppSelector((state) => state.referencesCategory.categories);
  const successMessage = useAppSelector((state) => state.references.successMessage);
  const error = useAppSelector((state) => state.references.error);

  // --- STATE ---
  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [contents, setContents] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [category, setCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // FILL ON EDIT
  useEffect(() => {
    if (editingItem) {
      setTitles(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = editingItem.title?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setContents(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = editingItem.content?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
    } else {
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setContents(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setCategory("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // TOAST
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // IMAGE HANDLER
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", JSON.stringify(titles));
    formData.append("content", JSON.stringify(contents));
    formData.append("category", category);

    // Zorunlu image(s)
    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }
    // Varsayılan olarak yayında (değilse, isPublished eklenmez!)
    formData.append("isPublished", "true");

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.references.edit", "Edit Reference")
          : t("admin.references.create", "Add Reference")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.references.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
            />

            <label htmlFor={`content-${lng}`}>
              {t("admin.references.content", "Content")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`content-${lng}`}
              value={contents[lng]}
              onChange={(e) =>
                setContents({ ...contents, [lng]: e.target.value })
              }
            />
          </div>
        ))}

        <label>{t("admin.references.image", "Logo Image")}</label>
        <ImageUploadWithPreview
          max={1}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="references"
        />

        <label htmlFor="category">
          {t("admin.references.category", "Category")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.references.select_category", "Select a category")}
          </option>
          {categories.map((cat: ReferencesCategory) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[lang] || cat.name?.en || Object.values(cat.name || {})[0] || cat.slug}
            </option>
          ))}
        </select>

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

// --- Styled Components ---
const FormWrapper = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
  border-radius: ${({ theme }) => theme.radii.md || "6px"};

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
    border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground || "#fff"};
    color: ${({ theme }) => theme.colors.text || "#000"};
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
      background: ${({ theme }) => theme.colors.primary || "#007bff"};
      color: #fff;
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.danger || "#dc3545"};
      color: #fff;
    }

    &:hover {
      opacity: 0.9;
    }
  }
`;
