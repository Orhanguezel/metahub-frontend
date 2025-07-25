import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { LibraryCategory, ILibrary } from "@/modules/library/types";
import { ImageUploadWithPreview } from "@/shared";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ILibrary | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function FormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((state) => state.libraryCategory.categories);
  const successMessage = useAppSelector((state) => state.library.successMessage);
  const error = useAppSelector((state) => state.library.error);
  const currentUser = useAppSelector((state) => state.account.profile);

  // State'ler
  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [summaries, setSummaries] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [contents, setContents] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );

  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]); // EKLENDİ

  // Formu editlerken doldur
  useEffect(() => {
    if (editingItem) {
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => {
        acc[lng] = editingItem.title?.[lng] || "";
        return acc;
      }, {} as Record<SupportedLocale, string>));
      setSummaries(SUPPORTED_LOCALES.reduce((acc, lng) => {
        acc[lng] = editingItem.summary?.[lng] || "";
        return acc;
      }, {} as Record<SupportedLocale, string>));
      setContents(SUPPORTED_LOCALES.reduce((acc, lng) => {
        acc[lng] = editingItem.content?.[lng] || "";
        return acc;
      }, {} as Record<SupportedLocale, string>));
      setAuthor(editingItem.author || currentUser?.name || "");
      setTags(editingItem.tags?.join(", ") || "");
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setRemovedImages([]);
      setSelectedPdf(null);
      setRemovedFiles([]); // EKLENDİ
    } else {
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setSummaries(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setContents(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setAuthor(currentUser?.name || "");
      setTags("");
      setCategory("");
      setExistingImages([]);
      setRemovedImages([]);
      setSelectedPdf(null);
      setRemovedFiles([]); // EKLENDİ
    }
  }, [editingItem, isOpen, currentUser]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // Görsel değişim handler
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedImages(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // PDF dosyası seçimi
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Yalnızca PDF dosyası seçebilirsiniz.");
        e.target.value = "";
        return;
      }
      setSelectedPdf(file);
      setRemovedFiles([]); // yeni dosya seçildiyse eskisini kaldırmayı unutma!
    }
  };

  // Mevcut PDF sil (X ile)
  const handleRemovePdf = () => {
    if (existingPdf) setRemovedFiles([existingPdf.url]);
    setSelectedPdf(null);
  };

  const handleRemoveSelectedPdf = () => setSelectedPdf(null);

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

    for (const file of selectedImages) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }
    // --- EK: PDF dosya ekle ve sil ---
    if (selectedPdf) {
      formData.append("files", selectedPdf);
    }
    if (removedFiles.length > 0) {
      formData.append("removedFiles", JSON.stringify(removedFiles));
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  // Mevcut pdf gösterimi (varsa)
  const existingPdf =
    editingItem?.files && editingItem.files.length > 0
      ? editingItem.files[0]
      : null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.library.edit", "Edit Library")
          : t("admin.library.create", "Create New Library")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.library.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
            />

            <label htmlFor={`summary-${lng}`}>
              {t("admin.library.summary", "Summary")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`summary-${lng}`}
              value={summaries[lng]}
              onChange={(e) =>
                setSummaries({ ...summaries, [lng]: e.target.value })
              }
            />

            <label htmlFor={`content-${lng}`}>
              {t("admin.library.content", "Content")} ({lng.toUpperCase()})
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

        <label htmlFor="author">{t("admin.library.author", "Author")}</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <label htmlFor="tags">{t("admin.library.tags", "Tags")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />

        <label>{t("admin.library.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="library"
        />

        {/* PDF dosya input */}
        <label htmlFor="pdf-file">{t("admin.library.pdf", "PDF File")}</label>
        <input
          id="pdf-file"
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
        />
        {/* Eski PDF varsa ve silinmediyse */}
        {existingPdf && !selectedPdf && removedFiles.length === 0 && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <a href={existingPdf.url} target="_blank" rel="noopener noreferrer">
              {existingPdf.name || "PDF"}
            </a>
            <button
              type="button"
              onClick={handleRemovePdf}
              aria-label={t("admin.remove", "Remove PDF")}
              style={{
                marginLeft: 4,
                background: "none",
                border: "none",
                color: "#dc3545",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 700,
              }}
              title={t("admin.remove", "Remove PDF")}
            >
              ×
            </button>
          </div>
        )}
        {/* Yeni PDF seçildiyse */}
        {selectedPdf && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            {selectedPdf.name}
            <button
              type="button"
              onClick={handleRemoveSelectedPdf}
              aria-label={t("admin.remove", "Remove PDF")}
              style={{
                marginLeft: 4,
                background: "none",
                border: "none",
                color: "#dc3545",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 700,
              }}
              title={t("admin.remove", "Remove PDF")}
            >
              ×
            </button>
          </div>
        )}

        <label htmlFor="category">
          {t("admin.library.category", "Category")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.library.select_category", "Select a category")}
          </option>
          {categories.map((cat: LibraryCategory) => (
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
