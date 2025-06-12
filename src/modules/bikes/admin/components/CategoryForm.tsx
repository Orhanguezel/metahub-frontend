"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createBikeCategory,
  updateBikeCategory,
  clearCategoryMessages,
} from "@/modules/bikes/slice/bikeCategorySlice";
import { useTranslation } from "react-i18next";
import type { BikeCategory } from "@/modules/bikes/types";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

interface BikeCategoryFormProps {
  onClose: () => void;
  editingItem?: BikeCategory | null;
}

// Her dil için otomatik alan başlatıcı
function initLabel(): Partial<TranslatedLabel> {
  const obj: Partial<TranslatedLabel> = {};
  for (const lng of SUPPORTED_LOCALES) obj[lng] = "";
  return obj;
}

export default function BikeCategoryForm({
  onClose,
  editingItem,
}: BikeCategoryFormProps) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("bike");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.bikeCategory
  );

  const [name, setName] = useState<Partial<TranslatedLabel>>(initLabel());
  const [description, setDescription] = useState<Partial<TranslatedLabel>>(initLabel());

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || initLabel());
      setDescription(editingItem.description || initLabel());
    } else {
      setName(initLabel());
      setDescription(initLabel());
    }
  }, [editingItem]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearCategoryMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (
    field: "name" | "description",
    lang: SupportedLocale,
    value: string
  ) => {
    if (field === "name") setName((prev) => ({ ...prev, [lang]: value }));
    else setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, description };
      if (editingItem?._id) {
        await dispatch(
          updateBikeCategory({ id: editingItem._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createBikeCategory(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("❌ Category operation failed:", err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3>
        {editingItem
          ? t("admin.editCategory", "Edit Category")
          : t("admin.newCategory", "New Category")}
      </h3>

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={lng}>
          <label htmlFor={`name-${lng}`}>{t("admin.categories.name", "Category Name")} ({lng.toUpperCase()})</label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng] ?? ""}
            onChange={(e) => handleChange("name", lng, e.target.value)}
            placeholder={t(
              "admin.categories.add",
              `Category name (${lng.toUpperCase()})`
            )}
            required={lng === (i18n.language as SupportedLocale) || lng === "en"}
          />
          <label htmlFor={`desc-${lng}`}>{t("admin.optional_description", "Optional description")} ({lng.toUpperCase()})</label>
          <textarea
            id={`desc-${lng}`}
            value={description[lng] ?? ""}
            onChange={(e) => handleChange("description", lng, e.target.value)}
            placeholder={t("admin.category_info", "What is this category about?")}
          />
        </div>
      ))}

      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {successMessage && <SuccessMessage>✅ {successMessage}</SuccessMessage>}

      <Button type="submit" disabled={loading}>
        {loading
          ? t("admin.saving", "Saving...")
          : editingItem
          ? t("admin.update2", "Update")
          : t("admin.save", "Save")}
      </Button>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const Button = styled.button`
  align-self: flex-end;
  padding: 0.5rem 1.25rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
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

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 0.9rem;
`;
