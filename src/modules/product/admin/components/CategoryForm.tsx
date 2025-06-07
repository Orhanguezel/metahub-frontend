"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createRadonarCategory,
  updateRadonarCategory,
  clearCategoryMessages,
  RadonarCategory,
} from "@/modules/product/slice/radonarCategorySlice";
import { useTranslation } from "react-i18next";

interface ProductCategoryFormProps {
  onClose: () => void;
  editingItem?: RadonarCategory | null;
}

export default function ProductCategoryForm({
  onClose,
  editingItem,
}: ProductCategoryFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("product");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.radonarCategory
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
          updateRadonarCategory({
            id: editingItem._id,
            data: { name, description },
          })
        ).unwrap();
      } else {
        await dispatch(createRadonarCategory({ name, description })).unwrap();
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
            placeholder={t(
              "admin.categories.add",
              `Category name (${lng.toUpperCase()})`
            )}
            required
          />
        </div>
      ))}

      <label htmlFor="desc">{t("admin.optional_description", "Optional description")}</label>
      <textarea
        id="desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("admin.category_info", "What is this category about?")}
      />

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
