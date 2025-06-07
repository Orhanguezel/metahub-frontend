"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServiceCategories,
  clearCategoryMessages,
} from "@/modules/services/slice/serviceCategorySlice";
import { IServices } from "@/modules/services";
import { useTranslation } from "react-i18next";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IServices | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const LANGUAGES: ("tr" | "en" | "de")[] = ["tr", "en", "de"];

export default function ServicesFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { t, i18n } = useTranslation("services");
  const currentLang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.serviceCategory);

  // Çok dilli alanlar ve resim state
  const [titles, setTitles] = useState<Record<string, string>>({ tr: "", en: "", de: "" });
  const [summaries, setSummaries] = useState<Record<string, string>>({ tr: "", en: "", de: "" });
  const [contents, setContents] = useState<Record<string, string>>({ tr: "", en: "", de: "" });
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");

  // Çoklu görsel için state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchServiceCategories());
    return () => {
      dispatch(clearCategoryMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if (editingItem) {
      setTitles(editingItem.title || { tr: "", en: "", de: "" });
      setSummaries(editingItem.summary || { tr: "", en: "", de: "" });
      setContents(editingItem.content || { tr: "", en: "", de: "" });
      setTags(editingItem.tags?.join(", ") || "");
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setPrice(editingItem.price ?? "");
      setDurationMinutes(editingItem.durationMinutes ?? "");
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setTitles({ tr: "", en: "", de: "" });
      setSummaries({ tr: "", en: "", de: "" });
      setContents({ tr: "", en: "", de: "" });
      setTags("");
      setCategory("");
      setPrice("");
      setDurationMinutes("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // Çoklu görsel bileşeninden değişiklikleri al
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", JSON.stringify(titles));
    formData.append("summary", JSON.stringify(summaries));
    formData.append("content", JSON.stringify(contents));
    formData.append(
      "tags",
      JSON.stringify(
        tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );
    formData.append("category", category);
    formData.append("isPublished", "true");
    formData.append("price", price ? price.toString() : "");
    formData.append("durationMinutes", durationMinutes ? durationMinutes.toString() : "");

    // Çoklu dosya ekleme
    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    // Silinen görseller
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem ? t("admin.services.edit", "Edit Service") : t("admin.services.create", "Add Service")}
      </h2>
      <form onSubmit={handleSubmit}>
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.services.title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              type="text"
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
              required
            />

            <label htmlFor={`summary-${lng}`}>
              {t("admin.services.summary")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`summary-${lng}`}
              value={summaries[lng]}
              onChange={(e) =>
                setSummaries({ ...summaries, [lng]: e.target.value })
              }
              required
            />

            <label htmlFor={`content-${lng}`}>
              {t("admin.services.content")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`content-${lng}`}
              value={contents[lng]}
              onChange={(e) =>
                setContents({ ...contents, [lng]: e.target.value })
              }
              required
            />
          </div>
        ))}

        <label htmlFor="price">{t("admin.services.price")}</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="€"
        />

        <label htmlFor="duration">{t("admin.services.duration")}</label>
        <input
          id="duration"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          placeholder={t("admin.services.duration_placeholder", "Minutes")}
        />

        <label htmlFor="tags">{t("admin.services.tags")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />

        <label>{t("admin.services.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="service"
        />

        <label htmlFor="category">{t("admin.services.category")}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.services.select_category")}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name[currentLang]} ({cat.slug})
            </option>
          ))}
        </select>

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

// Styled Components
const FormWrapper = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
  border-radius: ${({ theme }) => theme.radii.md || "6px"};

  h2 {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground || "#fff"};
    color: ${({ theme }) => theme.colors.text || "#000"};
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
      background: ${({ theme }) => theme.colors.primary || "#007bff"};
      color: #fff;
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.danger || "#dc3545"};
      color: #fff;
    }

    &:hover {
      opacity: 0.9;
    }
  }
`;
