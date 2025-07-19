"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { GalleryUploadWithPreview } from "@/shared";
import { toast } from "react-toastify";
import type { IGalleryCategory, IGallery, IGalleryItem } from "@/modules/gallery/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IGallery | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
  categories: IGalleryCategory[];
}

export default function GalleryEditForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  categories,
}: Props) {
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // --- STATE ---
  const [names, setNames] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [descriptions, setDescriptions] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [order, setOrder] = useState("1");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // --- existingImages artık IGalleryItem[] ---
  const [existingImages, setExistingImages] = useState<IGalleryItem[]>([]);

  // defaultImages as IGalleryItem[]
  const defaultImages = useMemo(
    () => editingItem?.images || [],
    [editingItem]
  );

  // --- FILL ON EDIT ---
  useEffect(() => {
    if (editingItem) {
      setNames(
        SUPPORTED_LOCALES.reduce((acc, l) => {
          acc[l] = editingItem.images?.[0]?.name?.[l] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setDescriptions(
        SUPPORTED_LOCALES.reduce((acc, l) => {
          acc[l] = editingItem.images?.[0]?.description?.[l] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setType(editingItem.type || "image");
      setOrder(editingItem.images?.[0]?.order?.toString() || "1");
      setExistingImages(defaultImages);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setNames(SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: "" }), {} as Record<SupportedLocale, string>));
      setDescriptions(SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: "" }), {} as Record<SupportedLocale, string>));
      setCategory("");
      setType("image");
      setOrder("1");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen, defaultImages]);

  // --- IMAGE HANDLER ---
  // IGalleryItem[]
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: IGalleryItem[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current); // current -> kalan eski resimler
    },
    []
  );

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !type || !names[lang]?.trim()) {
      toast.error(t("errors.requiredFields") || "Please fill required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", JSON.stringify(names));
    formData.append("description", JSON.stringify(descriptions));
    formData.append("category", category);
    formData.append("type", type);
    formData.append("order", order);

    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }
    // 🔥 kalan eski resimler url listesini gönder
    if (existingImages.length > 0) {
      formData.append("existingImages", JSON.stringify(existingImages.map(img => img.url)));
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("form.edit", "Edit Gallery Item")
          : t("form.create", "Create Gallery Item")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`name-${lng}`}>
              {t("form.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`name-${lng}`}
              value={names[lng]}
              onChange={(e) => setNames({ ...names, [lng]: e.target.value })}
            />

            <label htmlFor={`desc-${lng}`}>
              {t("form.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={descriptions[lng]}
              onChange={(e) =>
                setDescriptions({ ...descriptions, [lng]: e.target.value })
              }
            />
          </div>
        ))}

        <label htmlFor="category">{t("form.category", "Category")}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("form.selectCategory", "Select a category")}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[lang] || cat.name?.en || Object.values(cat.name || {})[0] || cat.slug}
            </option>
          ))}
        </select>

        <label htmlFor="type">{t("form.type", "Type")}</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as "image" | "video")}
          required
        >
          <option value="image">{t("form.type_image", "Image")}</option>
          <option value="video">{t("form.type_video", "Video")}</option>
        </select>

        <label htmlFor="order">{t("form.order", "Order")}</label>
        <input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          min={1}
        />

        <label>{t("form.image", "Images")}</label>
        <GalleryUploadWithPreview
          max={5}
          defaultImages={defaultImages} // IGalleryItem[]
          onChange={handleImagesChange}
          folder="gallery"
        />

        <ButtonGroup>
          <button type="submit">
            {editingItem
              ? t("form.save", "Save")
              : t("form.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("form.cancel", "Cancel")}
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
