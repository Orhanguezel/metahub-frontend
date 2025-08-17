// src/modules/gallery/components/GalleryCategoryFormModal.tsx
"use client";

import React, { useState, useEffect} from "react";
import styled from "styled-components";
import type { GalleryCategory } from "@/modules/gallery/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import ImageUploader, { type UploadImage } from "@/shared/ImageUploader";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: GalleryCategory | null;
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

  // --- Çok dilli alanlar
  const [name, setName] = useState<Record<SupportedLocale, string>>(EMPTY_LABEL);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(EMPTY_LABEL);

  // --- Görsel yönetimi (ImageUploader ile aynı pattern)
  const [existing, setExisting] = useState<UploadImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // --- Edit Mode Fill ---
  useEffect(() => {
    if (editingItem) {
      setName({ ...EMPTY_LABEL, ...(editingItem.name || {}) });
      setDescription({ ...EMPTY_LABEL, ...(editingItem.description || {}) });

      // Tip tarafında images yok; backend dönüyor olabilir → güvenli map
      const imgs: UploadImage[] = Array.isArray((editingItem as any).images)
        ? (editingItem as any).images.map((img: any) => ({
            url: img?.url,
            thumbnail: img?.thumbnail,
            webp: img?.webp,
            publicId: img?.publicId,
          }))
        : [];
      setExisting(imgs);
      setRemovedExisting([]);
      setFiles([]);
    } else {
      setName(EMPTY_LABEL);
      setDescription(EMPTY_LABEL);
      setExisting([]);
      setRemovedExisting([]);
      setFiles([]);
    }
  }, [editingItem, isOpen]);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Boşları ilk dolu değerle tamamla (gallery ile aynı yaklaşım)
    const filledName = { ...name };
    const firstName = Object.values(filledName).find((v) => (v || "").trim());
    if (firstName) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledName[lng]) filledName[lng] = firstName;
      });
    }
    const filledDesc = { ...description };
    const firstDesc = Object.values(filledDesc).find((v) => (v || "").trim());
    if (firstDesc) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDesc[lng]) filledDesc[lng] = firstDesc;
      });
    }

    if (!Object.values(filledName).some((v) => (v || "").trim())) {
      toast.error(t("admin.gallerycategory.name_required", "Category name is required."));
      return;
    }

    const formData = new FormData();
    formData.append("name", JSON.stringify(filledName));
    formData.append("description", JSON.stringify(filledDesc));

    files.forEach((file) => formData.append("images", file)); // field adı: images

    if (removedExisting.length > 0) {
      formData.append(
        "removedImages",
        JSON.stringify(
          removedExisting.map((x) => ({ url: x.url, publicId: x.publicId }))
        )
      );
    }

    try {
      await onSubmit(formData, editingItem?._id);
      onClose();
    } catch {
      toast.error(t("admin.gallerycategory.submit_error", "Error submitting category."));
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
              value={name[lng] || ""}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              autoComplete="off"
            />

            <label htmlFor={`desc-${lng}`}>
              {t("admin.gallerycategory.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={description[lng] || ""}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              autoComplete="off"
            />
          </div>
        ))}

        <label>{t("admin.gallerycategory.image", "Images")}</label>
        <ImageUploader
          existing={existing}
          onExistingChange={setExisting}
          removedExisting={removedExisting}
          onRemovedExistingChange={setRemovedExisting}
          files={files}
          onFilesChange={setFiles}
          maxFiles={5}
          accept="image/*"
          sizeLimitMB={15}
          helpText={t("uploader.help", "PNG/JPG/WebP, up to 5 images")}
        />

        <ButtonGroup>
          <button type="submit">
            {editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}

/* ---- Styles (gallery ile uyumlu) ---- */
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
    color: ${({ theme }) => theme.colors.title};
  }

  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.6rem;
    border: 1px solid ${({ theme }) => theme.colors.inputBorder || theme.colors.border};
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    outline: none;
    transition: border-color .15s ease;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
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
    padding: 0.6rem 1rem;
    font-weight: 600;
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    cursor: pointer;
    transition: opacity .15s ease;
  }

  button:first-child {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }

  button:last-child {
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
  }

  button:hover { opacity: .9; }
`;
