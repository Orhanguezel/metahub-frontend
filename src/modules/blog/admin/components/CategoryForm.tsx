"use client";

import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import type { BlogCategory } from "@/modules/blog/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: BlogCategory | null;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => Promise<void>;
}

export default function BlogCategoryForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { i18n, t } = useI18nNamespace("blog", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  // Empty state objesi (useMemo ile!)
  const emptyLabel = useMemo(
    () =>
      SUPPORTED_LOCALES.reduce(
        (acc, lng) => ({ ...acc, [lng]: "" }),
        {} as Record<SupportedLocale, string>
      ),
    []
  );

  // Form state
  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);

  // Edit durumunda doldur
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription(editingItem.description ? { ...emptyLabel, ...editingItem.description } : emptyLabel);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
    }
  }, [editingItem, isOpen, lang, emptyLabel]); // (emptyLabel artık değişmiyor!)

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // En az bir dilde isim girilmiş olmalı (öncelik seçili dil)
    const mainName = name[lang] || Object.values(name).find((v) => v.trim()) || "";
    if (!mainName.trim()) {
      alert(t("admin.blogcategory.name_required", "Category name required"));
      return;
    }
    // Tüm boş dillere ana ismi doldur (copy fill)
    const filledName = { ...name };
    SUPPORTED_LOCALES.forEach((lng) => {
      if (!filledName[lng]) filledName[lng] = mainName;
    });

    // Description için de aynısı (opsiyonel)
    const mainDesc = description[lang] || Object.values(description).find((v) => v.trim()) || "";
    const filledDescription = { ...description };
    if (mainDesc) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDescription[lng]) filledDescription[lng] = mainDesc;
      });
    }

    await onSubmit({ name: filledName, description: filledDescription }, editingItem?._id);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.blogcategory.edit", "Edit Blog Category")
          : t("admin.blogcategory.create", "Add New Blog Category")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label>
              {t("admin.blogcategory.name", "Category Name")} ({lng.toUpperCase()})
            </label>
            <input
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === lang}
              placeholder={t("admin.blogcategory.name_placeholder", "Enter name")}
              autoFocus={lng === lang}
            />

            <label>
              {t("admin.blogcategory.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              value={description[lng]}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              placeholder={t("admin.blogcategory.desc_placeholder", "Optional")}
            />
          </div>
        ))}

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


// --- Styled Components ---
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
    font-weight: 600;
  }

  input,
  textarea {
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.inputBackground};
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
