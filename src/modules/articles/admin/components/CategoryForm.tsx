"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createArticlesCategory,
  updateArticlesCategory,
  clearCategoryMessages,
  ArticlesCategory,
} from "@/modules/articles/slice/articlesCategorySlice";
import { useTranslation } from "react-i18next";

interface AriclesCategoryFormProp {
  onClose: () => void;
  editingItem?: ArticlesCategory | null;
}

export default function ArticlesCategoryForm({
  onClose,
  editingItem,
}: AriclesCategoryFormProp) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminArticles");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.articlesCategory
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
      const timeout = setTimeout(() => dispatch(clearCategoryMessages()), 3000);
      return () => clearTimeout(timeout);
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
          updateArticlesCategory({
            id: editingItem._id,
            data: { name, description },
          })
        ).unwrap();
      } else {
        await dispatch(createArticlesCategory({ name, description })).unwrap();
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
          ? t("categories.edit", "Edit Category")
          : t("categories.create", "New Category")}
      </h3>

      {["tr", "en", "de"].map((lng) => (
        <div key={lng}>
          <label htmlFor={`name-${lng}`}>
            {t(`languages.${lng}`, lng.toUpperCase())}:
          </label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng as "tr" | "en" | "de"]}
            onChange={(e) =>
              handleChange(lng as "tr" | "en" | "de", e.target.value)
            }
            placeholder={t(
              "categories.name_placeholder",
              `Category name (${lng.toUpperCase()})`
            )}
            required
          />
        </div>
      ))}

      <label htmlFor="desc">
        {t("categories.description", "Description (optional)")}
      </label>
      <textarea
        id="desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t(
          "categories.description_placeholder",
          "What is this category about?"
        )}
      />

      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {successMessage && <SuccessMessage>✅ {successMessage}</SuccessMessage>}

      <Button type="submit" disabled={loading}>
        {loading
          ? t("saving", "Saving...")
          : editingItem
          ? t("update", "Update")
          : t("save", "Save")}
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
    font-size: 0.95rem;
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
