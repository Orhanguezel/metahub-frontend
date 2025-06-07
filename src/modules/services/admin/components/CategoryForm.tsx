"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createServiceCategory,
  updateServiceCategory,
  clearCategoryMessages,
  ServiceCategory,
} from "@/modules/services/slice/serviceCategorySlice";
import { useTranslation } from "react-i18next";

interface CategoryFormProps {
  onClose: () => void;
  editingItem?: ServiceCategory | null;
}

export default function ServicesCategoryForm({
  onClose,
  editingItem,
}: CategoryFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("services");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.serviceCategory
  );

  const [name, setName] = useState({ tr: "", en: "", de: "" });
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || { tr: "", en: "", de: "" });
      setDescription(editingItem.description || "");
    } else {
      setName({ tr: "", en: "", de: "" });
      setDescription("");
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

  const handleChange = (lang: "tr" | "en" | "de", value: string) => {
    setName((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem?._id) {
        await dispatch(
          updateServiceCategory({
            id: editingItem._id,
            data: { name, description },
          })
        ).unwrap();
      } else {
        await dispatch(createServiceCategory({ name, description })).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("❌ Kategori işlemi başarısız:", err);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3>
        {editingItem
          ? t("admin.services.edit_category", "Edit Category")
          : t("admin.services.new_category", "New Category")}
      </h3>

      {["tr", "en", "de"].map((lng) => (
        <div key={lng}>
          <label htmlFor={`name-${lng}`}>{lng.toUpperCase()}:</label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng as "tr" | "en" | "de"]}
            onChange={(e) =>
              handleChange(lng as "tr" | "en" | "de", e.target.value)
            }
            placeholder={t("admin.services.category_name", {
              lng: lng.toUpperCase(),
            })}
            required
          />
        </div>
      ))}

      <label htmlFor="desc">
        {t("admin.services.description_optional", "Description (optional)")}
      </label>
      <textarea
        id="desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t(
          "admin.services.category_description_placeholder",
          "What is this category about?"
        )}
      />

      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {successMessage && <SuccessMessage>✅ {successMessage}</SuccessMessage>}

      <Button type="submit" disabled={loading}>
        {loading
          ? t("admin.loading", "Saving...")
          : editingItem
          ? t("admin.update", "Update")
          : t("admin.create", "Create")}
      </Button>
    </Form>
  );
}

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
