"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { uploadGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ImageUploadWithPreview } from "@/shared";
import type { GalleryCategory } from "@/modules/gallery/types/gallery";

interface GalleryMultiFormProps {
  categories: GalleryCategory[];
  onUpdate?: () => void;
}

const initialForm = {
  category: "",
  type: "image",
  title_tr: "",
  title_en: "",
  title_de: "",
  desc_tr: "",
  desc_en: "",
  desc_de: "",
  order: "1",
};

const GalleryMultiForm: React.FC<GalleryMultiFormProps> = ({
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("gallery");

  const [formData, setFormData] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = categories.find(
    (cat) => cat._id === formData.category
  );

  const isSingleImageCategory =
    selectedCategory &&
    (selectedCategory.slug === "hero" || selectedCategory.slug === "cover");

  const requiredFields = [
    "category",
    "type",
    "title_tr",
    "title_en",
    "title_de",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingField = requiredFields.find(
      (field) => !formData[field as keyof typeof formData]
    );
    if (missingField || files.length === 0) {
      toast.error(t("errors.requiredFields"));
      return;
    }
    if (isSingleImageCategory && files.length > 1) {
      toast.error(
        t("errors.singleImageLimit") ||
          "Only one image allowed for this category."
      );
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        data.append(key, value);
      }
    });
    files.forEach((file) => data.append("images", file));

    try {
      setIsLoading(true);
      await dispatch(uploadGalleryItem(data)).unwrap();
      toast.success(t("upload.success"));
      setFormData(initialForm);
      setFiles([]);
      onUpdate?.();
    } catch (err) {
      toast.error((err as any)?.message || t("upload.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <Title>{t("form.title")}</Title>

      <label htmlFor="category">{t("form.category")}</label>
      <Select
        id="category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
      >
        <option value="">{t("form.selectCategory")}</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name?.[i18n.language as "tr" | "en" | "de"] ||
              cat.name?.tr ||
              cat.slug}
          </option>
        ))}
      </Select>

      <label htmlFor="type">{t("form.type")}</label>
      <Select
        id="type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      >
        <option value="image">{t("form.type_image", "Image")}</option>
        <option value="video">{t("form.type_video", "Video")}</option>
      </Select>

      <label htmlFor="title_tr">{t("form.title_tr")}</label>
      <StyledInput
        id="title_tr"
        type="text"
        value={formData.title_tr}
        onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
        required
      />

      <label htmlFor="title_en">{t("form.title_en")}</label>
      <StyledInput
        id="title_en"
        type="text"
        value={formData.title_en}
        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
        required
      />

      <label htmlFor="title_de">{t("form.title_de")}</label>
      <StyledInput
        id="title_de"
        type="text"
        value={formData.title_de}
        onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
        required
      />

      <label htmlFor="desc_tr">{t("form.desc_tr")}</label>
      <TextArea
        id="desc_tr"
        value={formData.desc_tr}
        onChange={(e) => setFormData({ ...formData, desc_tr: e.target.value })}
      />

      <label htmlFor="desc_en">{t("form.desc_en")}</label>
      <TextArea
        id="desc_en"
        value={formData.desc_en}
        onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
      />

      <label htmlFor="desc_de">{t("form.desc_de")}</label>
      <TextArea
        id="desc_de"
        value={formData.desc_de}
        onChange={(e) => setFormData({ ...formData, desc_de: e.target.value })}
      />

      <label htmlFor="order">{t("form.order")}</label>
      <StyledInput
        id="order"
        type="number"
        value={formData.order}
        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
        min={1}
      />

      <ImageUploadWithPreview
        max={isSingleImageCategory ? 1 : 10}
        folder="gallery"
        onChange={setFiles}
      />

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? t("form.loading") : t("form.submit")}
      </SubmitButton>
    </Form>
  );
};

export default GalleryMultiForm;

// Styled Components

const inputStyles = css`
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 540px;
  margin: 0 auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    gap: ${({ theme }) => theme.spacing.md};
  }

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

const StyledInput = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
`;

const TextArea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 80px;
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.lg};
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.opacity.disabled};
    box-shadow: none;
  }
`;

export {
  Form,
  Title,
  StyledInput,
  Select,
  TextArea,
  SubmitButton,
};
