"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createArticlesCategory,
  updateArticlesCategory,
  clearCategoryMessages,
} from "@/modules/articles/slice/articlesCategorySlice";
import { ArticlesCategory } from "@/modules/articles/types";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

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

  const [name, setName] = useState<Record<SupportedLocale, string>>(
    SUPPORTED_LOCALES.reduce((acc, lang) => {
      acc[lang] = "";
      return acc;
    }, {} as Record<SupportedLocale, string>)
  );

  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingItem) {
      const nameData = SUPPORTED_LOCALES.reduce((acc, lang) => {
        acc[lang] = editingItem.name?.[lang] || "";
        return acc;
      }, {} as Record<SupportedLocale, string>);

      setName(nameData);
      setDescription(editingItem.description || "");
    } else {
      setName(
        SUPPORTED_LOCALES.reduce((acc, lang) => {
          acc[lang] = "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setDescription("");
    }
  }, [editingItem]);

  useEffect(() => {
    if (successMessage || error) {
      const timeout = setTimeout(() => dispatch(clearCategoryMessages()), 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (lang: SupportedLocale, value: string) => {
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

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={lng}>
          <label htmlFor={`name-${lng}`}>
            {t(`languages.${lng}`, lng.toUpperCase())}:
          </label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng]}
            onChange={(e) => handleChange(lng, e.target.value)}
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

// 💅 Styled Components
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
