"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import type { NewsCategory } from "@/modules/news/types";
import { useAppDispatch } from "@/store/hooks";
import { fetchNewsCategories } from "@/modules/news/slice/newsCategorySlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: NewsCategory | null;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => Promise<void>;
}

export default function NewsCategoryForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("news", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const emptyLabel = SUPPORTED_LOCALES.reduce((acc, lng) => {
    acc[lng] = "";
    return acc;
  }, {} as Record<SupportedLocale, string>);

  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);

  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription(editingItem.description ? { ...emptyLabel, ...editingItem.description } : emptyLabel);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Name fill
    const firstName = Object.values(name).find((v) => v.trim());
    const filledName = { ...name };
    if (firstName) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledName[lng]) filledName[lng] = firstName;
      });
    }

    // Description fill
    const firstDesc = Object.values(description).find((v) => v.trim());
    const filledDescription = { ...description };
    if (firstDesc) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDescription[lng]) filledDescription[lng] = firstDesc;
      });
    }

    await onSubmit({ name: filledName, description: filledDescription }, editingItem?._id);

    // ⚡️ Listeyi yenilemek için:
    dispatch(fetchNewsCategories());

    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.newscategory.edit", "Edit News Category")
          : t("admin.newscategory.create", "Add New News Category")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label>
              {t("admin.newscategory.name", "Category Name")} ({lng.toUpperCase()})
            </label>
            <input
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === lang}
            />

            <label>
              {t("admin.newscategory.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              value={description[lng]}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              required={lng === lang}
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