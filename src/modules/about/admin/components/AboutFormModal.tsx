"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { AboutCategory, IAbout } from "@/modules/about/types";
import { ImageUploadWithPreview } from "@/shared";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";
import { clearAboutMessages } from "@/modules/about/slice/aboutSlice"; // Mutlaka doğru import et!

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IAbout | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function AboutFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  // --- DİL ve ÇEVİRİ ---
  const { t } = useI18nNamespace("about", translations);
  const lang = getCurrentLocale();
  const dispatch = useAppDispatch();

  // --- STATE ---
  const { categories } = useAppSelector((state) => state.aboutCategory);
  const { successMessage, error } = useAppSelector((state) => state.about);
  const currentUser = useAppSelector((state) => state.account.profile);

  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [summaries, setSummaries] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [contents, setContents] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // --- FILL ON EDIT ---
  useEffect(() => {
    if (editingItem) {
      setTitles(
        SUPPORTED_LOCALES.reduce((acc, lang) => {
          acc[lang] = editingItem.title?.[lang] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setSummaries(
        SUPPORTED_LOCALES.reduce((acc, lang) => {
          acc[lang] = editingItem.summary?.[lang] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setContents(
        SUPPORTED_LOCALES.reduce((acc, lang) => {
          acc[lang] = editingItem.content?.[lang] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setAuthor(editingItem.author || currentUser?.name || "");
      setTags(editingItem.tags?.join(", ") || "");
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
    } else {
      // Reset
      setTitles(SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>));
      setSummaries(SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>));
      setContents(SUPPORTED_LOCALES.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {} as Record<SupportedLocale, string>));
      setAuthor(currentUser?.name || "");
      setTags("");
      setCategory("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // --- TOAST Mesajları ---
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAboutMessages());
      onClose(); // Başarılı kayıttan sonra modalı kapat
    } else if (error) {
      toast.error(error);
      dispatch(clearAboutMessages());
      // Modal açık kalsın, kullanıcı tekrar deneyebilsin
    }
  }, [successMessage, error, dispatch, onClose]);

  // --- IMAGE HANDLER ---
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", JSON.stringify(titles));
    formData.append("summary", JSON.stringify(summaries));
    formData.append("content", JSON.stringify(contents));
    formData.append("author", author.trim());
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

    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    await onSubmit(formData, editingItem?._id);
    // Başarı durumunu useEffect ile handle edeceğiz
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.about.edit", "Edit Article")
          : t("admin.about.create", "Create New Article")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.about.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
            />

            <label htmlFor={`summary-${lng}`}>
              {t("admin.about.summary", "Summary")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`summary-${lng}`}
              value={summaries[lng]}
              onChange={(e) =>
                setSummaries({ ...summaries, [lng]: e.target.value })
              }
            />

            <label htmlFor={`content-${lng}`}>
              {t("admin.about.content", "Content")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`content-${lng}`}
              value={contents[lng]}
              onChange={(e) =>
                setContents({ ...contents, [lng]: e.target.value })
              }
            />
          </div>
        ))}

        <label htmlFor="author">{t("admin.about.author", "Author")}</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <label htmlFor="tags">{t("admin.about.tags", "Tags")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />

        <label>{t("admin.about.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="article"
        />

        <label htmlFor="category">
          {t("admin.about.category", "Category")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.about.select_category", "Select a category")}
          </option>
          {categories.map((cat: AboutCategory) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[lang] || cat.name?.en || Object.values(cat.name || {})[0] || cat.slug}
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
    </FormWrapper>
  );
}

// --- Styled Components ---
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
