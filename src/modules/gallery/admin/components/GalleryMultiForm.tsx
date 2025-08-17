// src/modules/gallery/components/GalleryMultiForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import styled, { css } from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";
import ImageUploader, { type UploadImage } from "@/shared/ImageUploader";
import { createGallery } from "@/modules/gallery/slice/gallerySlice";
import type { GalleryCategory } from "@/modules/gallery/types";

interface GalleryMultiFormProps {
  categories: GalleryCategory[];
  onUpdate?: () => void;
}

const emptyTL = SUPPORTED_LOCALES.reduce(
  (acc, lng) => ({ ...acc, [lng]: "" }),
  {} as Record<SupportedLocale, string>
);

const GalleryMultiForm: React.FC<GalleryMultiFormProps> = ({ categories, onUpdate }) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Form state (Yeni model)
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [title, setTitle] = useState<Record<SupportedLocale, string>>(emptyTL);
  const [summary, setSummary] = useState<Record<SupportedLocale, string>>(emptyTL);
  const [content, setContent] = useState<Record<SupportedLocale, string>>(emptyTL);
  const [order, setOrder] = useState("0");
  const [tags, setTags] = useState<string>("");

  // Uploader state
  const [existing, setExisting] = useState<UploadImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === category),
    [categories, category]
  );
  const isSingleImageCategory = selectedCategory
    ? ["hero", "cover"].includes(selectedCategory.slug)
    : false;

  const requiredOk = category && type && (title[lang] || "").trim();

  const normalizeTL = (obj: Record<SupportedLocale, string>) => {
    const copy = { ...obj };
    const first = Object.values(copy).find((v) => (v || "").trim()) || "";
    SUPPORTED_LOCALES.forEach((l) => {
      if (!copy[l]) copy[l] = first;
    });
    return copy;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredOk || files.length === 0) {
      toast.error(
        t("errors.requiredFields", "Please fill required fields and add at least one image.")
      );
      return;
    }

    const fd = new FormData();
    fd.append("category", category);
    fd.append("type", type);
    fd.append("order", order);

    fd.append("title", JSON.stringify(normalizeTL(title)));
    fd.append("summary", JSON.stringify(normalizeTL(summary)));
    fd.append("content", JSON.stringify(normalizeTL(content)));

    // tags backend’de flexible: CSV veya array kabul ediyor
    if (tags.trim()) fd.append("tags", tags);

    files.forEach((file) => fd.append("images", file));

    try {
      await dispatch(createGallery(fd)).unwrap();
      toast.success(t("upload.success", "Uploaded successfully."));
      // reset
      setCategory("");
      setType("image");
      setTitle(emptyTL);
      setSummary(emptyTL);
      setContent(emptyTL);
      setOrder("0");
      setTags("");
      setFiles([]);
      setExisting([]);
      setRemovedExisting([]);
      onUpdate?.();
    } catch (err: any) {
      toast.error(err?.message || t("upload.error", "Upload failed."));
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <Title>{t("form.title", "New Gallery Item")}</Title>

      <label htmlFor="category">{t("form.category", "Category")}</label>
      <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
        <option value="">{t("form.selectCategory", "Select a category")}</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name?.[lang] || cat.slug}
          </option>
        ))}
      </Select>

      <label htmlFor="type">{t("form.type", "Type")}</label>
      <Select
        id="type"
        value={type}
        onChange={(e) => setType(e.target.value as "image" | "video")}
        required
      >
        <option value="image">{t("form.type_image", "Image")}</option>
        <option value="video">{t("form.type_video", "Video")}</option>
      </Select>

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={lng}>
          <label htmlFor={`title-${lng}`}>
            {t("form.title_field", "Title")} ({lng.toUpperCase()})
          </label>
          <StyledInput
            id={`title-${lng}`}
            type="text"
            value={title[lng]}
            onChange={(e) => setTitle({ ...title, [lng]: e.target.value })}
            required={lng === lang}
          />

          <label htmlFor={`summary-${lng}`}>
            {t("form.summary", "Summary")} ({lng.toUpperCase()})
          </label>
          <TextArea
            id={`summary-${lng}`}
            value={summary[lng]}
            onChange={(e) => setSummary({ ...summary, [lng]: e.target.value })}
          />

          <label htmlFor={`content-${lng}`}>
            {t("form.content", "Content")} ({lng.toUpperCase()})
          </label>
          <TextArea
            id={`content-${lng}`}
            value={content[lng]}
            onChange={(e) => setContent({ ...content, [lng]: e.target.value })}
          />
        </div>
      ))}

      <label htmlFor="order">{t("form.order", "Order")}</label>
      <StyledInput
        id="order"
        type="number"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
      />

      <label htmlFor="tags">{t("form.tags", "Tags (comma separated)")}</label>
      <StyledInput
        id="tags"
        type="text"
        placeholder="art, summer, beach"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <label>{t("form.image", "Images")}</label>
      <ImageUploader
        existing={existing}
        onExistingChange={setExisting}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={files}
        onFilesChange={setFiles}
        maxFiles={isSingleImageCategory ? 1 : 10}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "PNG/JPG/WebP")}
      />

      <SubmitButton type="submit">{t("form.submit", "Submit")}</SubmitButton>
    </Form>
  );
};

export default GalleryMultiForm;

/* === styles (aynı dil) === */
const inputStyles = css`
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  transition: border ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xl};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.lg};
  max-width: 640px; margin: 0 auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
    gap: ${({ theme }) => theme.spacings.md};
  }

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: ${({ theme }) => theme.spacings.xs};
    margin-top: ${({ theme }) => theme.spacings.sm};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacings: 0.01em;
`;

const StyledInput = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
`;

const TextArea = styled.textarea`
  ${inputStyles}
  resize: vertical; min-height: 80px;
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.xl};
  border: none; border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer; margin-top: ${({ theme }) => theme.spacings.lg};
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal}, box-shadow ${({ theme }) => theme.transition.normal};

  &:hover, &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed; opacity: ${({ theme }) => theme.opacity.disabled};
    box-shadow: none;
  }
`;
