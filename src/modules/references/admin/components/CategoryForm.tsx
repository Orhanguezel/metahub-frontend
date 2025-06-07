"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { ReferenceCategory } from "@/modules/references/slice/referencesCategorySlice";

type Lang = "tr" | "en" | "de";

type CategoryName = {
  tr: string;
  en: string;
  de: string;
};

type CategoryDescription = {
  tr: string;
  en: string;
  de: string;
};

interface Props {
  editingItem?: ReferenceCategory | null;
  onClose: () => void;
  onSubmit: (
    data: { name: CategoryName; description: CategoryDescription },
    id?: string
  ) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

export default function ReferenceCategoryForm({
  editingItem,
  onSubmit,
  onClose,
  loading = false,
  error,
  successMessage,
}: Props) {
  const { t } = useTranslation("reference");
  // Çok dilli inputlar
  const [name, setName] = useState<CategoryName>({ tr: "", en: "", de: "" });
  const [description, setDescription] = useState<CategoryDescription>({
    tr: "",
    en: "",
    de: "",
  });
  const languages = useMemo(() => ["tr", "en", "de"] as Lang[], []);

  // Formu doldur
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || { tr: "", en: "", de: "" });
      setDescription(
        (editingItem.description as CategoryDescription) || {
          tr: "",
          en: "",
          de: "",
        }
      );
    } else {
      setName({ tr: "", en: "", de: "" });
      setDescription({ tr: "", en: "", de: "" });
    }
  }, [editingItem]);

  // Toastify ile hata/success gösterimi
  useEffect(() => {
    if (error) toast.error(error, { autoClose: 3500 });
    if (successMessage) toast.success(successMessage, { autoClose: 2500 });
  }, [error, successMessage]);

  const handleNameChange = useCallback((lang: Lang, value: string) => {
    setName((prev) => ({ ...prev, [lang]: value }));
  }, []);
  const handleDescriptionChange = useCallback((lang: Lang, value: string) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };
    try {
      await onSubmit(payload, editingItem?._id);
      onClose();
    } catch (err: any) {
      toast.error(t("admin.category_error", "An error occurred"), err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3>
        {editingItem
          ? t("admin.edit_category", "Edit Category")
          : t("admin.new_category", "New Category")}
      </h3>
      {languages.map((lng) => (
        <FieldGroup key={lng}>
          <label htmlFor={`name-${lng}`}>
            {t(`admin.name_${lng}`, `${lng.toUpperCase()} Name`)}
          </label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng]}
            onChange={(e) => handleNameChange(lng, e.target.value)}
            placeholder={t("admin.category_name_placeholder", {
              lng: lng.toUpperCase(),
            })}
            required
          />
          <label htmlFor={`desc-${lng}`} style={{ marginTop: 4 }}>
            {t(`admin.description_${lng}`, `${lng.toUpperCase()} Description`)}
          </label>
          <textarea
            id={`desc-${lng}`}
            value={description[lng]}
            onChange={(e) => handleDescriptionChange(lng, e.target.value)}
            placeholder={t(
              "admin.category_description_placeholder",
              `What is this category for?`
            )}
            rows={2}
          />
        </FieldGroup>
      ))}
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

// 💅 Styles
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.25rem;
  label {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.97rem;
  }
  textarea {
    min-height: 50px;
    resize: vertical;
  }
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  padding: 0.5rem 1.25rem;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
