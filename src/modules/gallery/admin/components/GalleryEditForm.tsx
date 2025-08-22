// src/modules/gallery/components/GalleryEditForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import ImageUploader, { type UploadImage } from "@/shared/ImageUploader";
import { toast } from "react-toastify";
import type { GalleryCategory, IGallery } from "@/modules/gallery/types";
import { completeLocales } from "@/utils/completeLocales";

// basit URL normalize: query/hash ve trailing slash farklarını tolere et
const normalizeUrl = (u?: string) => {
  if (!u) return "";
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(u, base);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return (u || "").replace(/\/+$/, "");
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IGallery | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
  categories: GalleryCategory[];
}

const initialByLocale = () =>
  SUPPORTED_LOCALES.reduce(
    (acc, l) => ({ ...acc, [l]: "" }),
    {} as Record<SupportedLocale, string>
  );

export default function GalleryEditForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  categories,
}: Props) {
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  // ---- Çok dilli alanlar ----
  const [title, setTitle] = useState<Record<SupportedLocale, string>>(initialByLocale());
  const [summary, setSummary] = useState<Record<SupportedLocale, string>>(initialByLocale());
  const [content, setContent] = useState<Record<SupportedLocale, string>>(initialByLocale());

  // ---- Diğer alanlar ----
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [order, setOrder] = useState("0");
  const [tags, setTags] = useState(""); // (opsiyonel) edit’te de destekle

  // ---- Görsel yönetimi (ImageUploader) ----
  const [existing, setExisting] = useState<UploadImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // (url/publicId) ⇒ _id fallback haritası
  const idBySig = useMemo(() => {
    const m = new Map<string, string>();
    (editingItem?.images || []).forEach((img) => {
      if (!img?._id) return;
      if (img.publicId) m.set(`pid:${img.publicId}`, img._id);
      if (img.url) m.set(`url:${normalizeUrl(img.url)}`, img._id);
    });
    return m;
  }, [editingItem?.images]);

  // Edit modunda değerleri yükle
  useEffect(() => {
    if (editingItem) {
      setTitle(completeLocales(editingItem.title));
      setSummary(completeLocales(editingItem.summary));
      setContent(completeLocales(editingItem.content));

      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setType(editingItem.type || "image");
      setOrder(String(editingItem.order ?? 0));

      // 🔴 ESKİ: _id’yi düşürüyordu → 🔵 YENİ: _id’yi koru
      setExisting(
        (editingItem.images || []).map((img) => ({
          _id: img._id,                 // ← önemli
          url: img.url,
          thumbnail: img.thumbnail,
          webp: img.webp,
          publicId: img.publicId,
        }))
      );

      setRemovedExisting([]);
      setFiles([]);

      // (opsiyonel) tags edit
      try {
        setTags((editingItem.tags || []).join(", "));
      } catch { setTags(""); }
    } else {
      setTitle(initialByLocale());
      setSummary(initialByLocale());
      setContent(initialByLocale());
      setCategory("");
      setType("image");
      setOrder("0");
      setExisting([]);
      setRemovedExisting([]);
      setFiles([]);
      setTags("");
    }
  }, [editingItem, isOpen]);

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basit doğrulama
    if (!category || !type || !String((title?.[lang] || "").trim())) {
      toast.error(t("errors.requiredFields", "Please fill required fields."));
      return;
    }

    const filledTitle = completeLocales(title);
    const filledSummary = completeLocales(summary);
    const filledContent = completeLocales(content);

    const formData = new FormData();
    formData.append("title", JSON.stringify(filledTitle));
    formData.append("summary", JSON.stringify(filledSummary));
    formData.append("content", JSON.stringify(filledContent));
    formData.append("category", category);
    formData.append("type", type);
    formData.append("order", order);

    // tags: CSV → hem simple hem JSON (backend flexible ise)
    const tagsArr = (tags || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (tagsArr.length) {
      tagsArr.forEach((tg) => formData.append("tags[]", tg));
      formData.append("tags", JSON.stringify(tagsArr));
    }

    // ✅ Yeni görseller (multer array('images'))
    files.forEach((file) => formData.append("images", file));

    // ✅ SİLME: önce id’ler, yoksa signature fallback
    const removeIds: string[] = [];
    const removeUrls: string[] = []; // backend’in yaygın beklediği alternatif

    removedExisting.forEach((img) => {
      if (img._id) {
        removeIds.push(img._id);
        return;
      }
      const byPid = img.publicId && idBySig.get(`pid:${img.publicId}`);
      const byUrl = img.url && idBySig.get(`url:${normalizeUrl(img.url)}`);
      if (byPid || byUrl) {
        removeIds.push((byPid || byUrl) as string);
      } else if (img.url) {
        removeUrls.push(img.url);
      }
    });

    if (removeIds.length) {
      // hem simple hem JSON
      removeIds.forEach((id) => formData.append("removeImageIds[]", id));
      formData.append("removeImageIds", JSON.stringify(removeIds));
      // bazı backendlerde alternatif isim:
      formData.append("removedImageIds", JSON.stringify(removeIds));
    }
    if (removeUrls.length) {
      // DİKKAT: string[] (objeyle değil) — çoğu backend bunu bekler
      formData.append("removedImages", JSON.stringify(removeUrls));
    }

    // ✅ SIRALAMA: id’ler varsa onları gönder; yoksa signature
    const orderIds = existing.map((x) => x._id).filter(Boolean) as string[];
    if (orderIds.length) {
      orderIds.forEach((id) => formData.append("existingImagesOrderIds[]", id));
      formData.append("existingImagesOrderIds", JSON.stringify(orderIds));
    } else if (existing.length) {
      const orderSig = existing.map((x) => x.publicId || x.url).filter(Boolean) as string[];
      if (orderSig.length) {
        formData.append("existingImagesOrder", JSON.stringify(orderSig));
      }
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("form.edit", "Edit Gallery Item")
          : t("form.create", "Create Gallery Item")}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Çok dilli alanlar */}
        {SUPPORTED_LOCALES.map((lng) => (
          <LocaleBlock key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("form.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={title[lng] || ""}
              onChange={(e) => setTitle({ ...title, [lng]: e.target.value })}
            />

            <label htmlFor={`summary-${lng}`}>
              {t("form.summary", "Summary")} ({lng.toUpperCase()})
            </label>
            <input
              id={`summary-${lng}`}
              value={summary[lng] || ""}
              onChange={(e) => setSummary({ ...summary, [lng]: e.target.value })}
            />

            <label htmlFor={`content-${lng}`}>
              {t("form.content", "Content")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`content-${lng}`}
              value={content[lng] || ""}
              onChange={(e) => setContent({ ...content, [lng]: e.target.value })}
            />
          </LocaleBlock>
        ))}

        {/* Kategori */}
        <label htmlFor="category">{t("form.category", "Category")}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("form.selectCategory", "Select a category")}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[lang] ||
                cat.name?.en ||
                Object.values(cat.name || {})[0] ||
                (cat as any).slug}
            </option>
          ))}
        </select>

        {/* Tip */}
        <label htmlFor="type">{t("form.type", "Type")}</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as "image" | "video")}
          required
        >
          <option value="image">{t("form.type_image", "Image")}</option>
          <option value="video">{t("form.type_video", "Video")}</option>
        </select>

        {/* Sıra */}
        <label htmlFor="order">{t("form.order", "Order")}</label>
        <input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          min={0}
        />

        {/* Tags (opsiyonel) */}
        <label htmlFor="tags">{t("form.tags", "Tags (comma separated)")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="art, summer, beach"
        />

        {/* Görseller */}
        <label>{t("form.image", "Images")}</label>
        <ImageUploader
          existing={existing}
          onExistingChange={setExisting}
          removedExisting={removedExisting}
          onRemovedExistingChange={setRemovedExisting}
          files={files}
          onFilesChange={setFiles}
          maxFiles={10}
          accept="image/*"
          sizeLimitMB={15}
          helpText={t("uploader.help", "PNG/JPG/WebP, up to 10 images")}
        />

        <ButtonGroup>
          <button type="submit">
            {editingItem ? t("form.save", "Save") : t("form.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("form.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}


/* ---- styled ---- */
const FormWrapper = styled.div`
  max-width: 760px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  h2 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.title};
  }

  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.inputBorder};
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    outline: none;
    transition: border-color .15s ease;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }

  textarea {
    min-height: 110px;
    resize: vertical;
  }
`;

const LocaleBlock = styled.div`
  & + & { margin-top: 0.75rem; }
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;

  button {
    padding: 0.6rem 1rem;
    font-weight: 600;
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
    cursor: pointer;
    transition: opacity .15s ease;
  }

  button[type="submit"] {
    background: ${({ theme }) => theme.buttons.primary.background};
    color: ${({ theme }) => theme.buttons.primary.text};
  }

  button[type="submit"]:hover { opacity: .9; }

  button[type="button"] {
    background: ${({ theme }) => theme.buttons.danger.background};
    color: ${({ theme }) => theme.buttons.danger.text};
  }

  button[type="button"]:hover { opacity: .9; }
`;
