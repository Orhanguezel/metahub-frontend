"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createAboutCategory,
  updateAboutCategory,
  clearCategoryMessages,
  AboutCategory,
} from "@/modules/about/slice/aboutCategorySlice";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
  editingItem?: AboutCategory | null;
}

export default function AboutCategoryForm({ onClose, editingItem }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("about");
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.aboutCategory
  );

  const [name, setName] = useState({ tr: "", en: "", de: "" });
  const [description, setDescription] = useState("");

  const languages = useMemo(() => ["tr", "en", "de"] as const, []);

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
      const timer = setTimeout(() => dispatch(clearCategoryMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = useCallback(
    (lang: "tr" | "en" | "de", value: string) => {
      setName((prev) => ({ ...prev, [lang]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };

    try {
      if (editingItem?._id) {
        await dispatch(
          updateAboutCategory({ id: editingItem._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createAboutCategory(payload)).unwrap();
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
          ? t("admin.edit_category", "Edit Category")
          : t("admin.new_category", "New Category")}
      </h3>

      {languages.map((lng) => (
        <FieldGroup key={lng}>
          <label htmlFor={`name-${lng}`}>{lng.toUpperCase()}</label>
          <input
            id={`name-${lng}`}
            type="text"
            value={name[lng]}
            onChange={(e) => handleChange(lng, e.target.value)}
            placeholder={t("admin.category_name_placeholder", {
              lng: lng.toUpperCase(),
            })}
            required
          />
        </FieldGroup>
      ))}

      <FieldGroup>
        <label htmlFor="desc">
          {t("admin.description_optional", "Description (optional)")}
        </label>
        <textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t(
            "admin.category_description_placeholder",
            "What is this category about?"
          )}
        />
      </FieldGroup>

      {error && <ErrorText>❌ {error}</ErrorText>}
      {successMessage && <SuccessText>✅ {successMessage}</SuccessText>}

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
  gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;

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
    font-size: 0.95rem;
  }

  textarea {
    min-height: 80px;
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

const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const SuccessText = styled.p`
  color: green;
  font-size: 0.9rem;
`;
