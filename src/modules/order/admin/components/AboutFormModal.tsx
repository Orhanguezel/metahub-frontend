"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAboutCategories,
  clearCategoryMessages,
} from "@/modules/about/slice/aboutCategorySlice";
import { IAbout } from "@/modules/about/types/about";
import { useTranslation } from "react-i18next";
import { ImageUploadWithPreview } from "@/shared";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IAbout | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const LANGUAGES: ("tr" | "en" | "de")[] = ["tr", "en", "de"];

export default function AboutFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("about");
  const currentLang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { categories } = useAppSelector((state) => state.aboutCategory);

  // Çok dilli alanlar
  const [titles, setTitles] = useState<Record<string, string>>({
    tr: "",
    en: "",
    de: "",
  });
  const [summaries, setSummaries] = useState<Record<string, string>>({
    tr: "",
    en: "",
    de: "",
  });
  const [contents, setContents] = useState<Record<string, string>>({
    tr: "",
    en: "",
    de: "",
  });
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<string>("");

  // Görsel yönetimi
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Kategorileri yükle
  useEffect(() => {
    dispatch(fetchAboutCategories());
    return () => {
      dispatch(clearCategoryMessages());
    };
  }, [dispatch]);

  // editingItem değişirse tüm state güncellenir
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
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setTitles({ tr: "", en: "", de: "" });
      setSummaries({ tr: "", en: "", de: "" });
      setContents({ tr: "", en: "", de: "" });
      setTags("");
      setCategory("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // Resim bileşeninden dosya değişikliği yakala
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
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    formData.append("category", category);
    formData.append("isPublished", "true");

    // Yeni eklenen dosyalar (çoklu destek)
    for (const file of selectedFiles) {
      formData.append("images", file);
    }

    // Silinmek istenen eski görseller
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <Container>
      <h2>
        {editingItem
          ? t("admin.about.edit", "Edit about")
          : t("admin.about.create", "New about")}
      </h2>
      <form onSubmit={handleSubmit}>
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.about.title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              type="text"
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
              required
            />

            <label htmlFor={`summary-${lng}`}>
              {t("admin.about.summary")} ({lng.toUpperCase()})
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
              {t("admin.about.content")} ({lng.toUpperCase()})
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

        <label>{t("admin.about.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="about"
        />

        <label htmlFor="category">{t("admin.about.category")}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.about.select_category", "Select category")}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[currentLang]} ({cat.slug})
            </option>
          ))}
        </select>

        <ButtonGroup>
          <button type="submit">
            {editingItem
              ? t("admin.update", "Update")
              : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </Container>
  );
}

// Styled Components aynen kullanılabilir
const Container = styled.div`
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
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
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
