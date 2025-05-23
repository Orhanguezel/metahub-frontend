"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { uploadGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {ImageUploadWithPreview} from "@/shared";

interface GalleryMultiFormProps {
  categories: string[];
  onUpdate?: () => void;
}

const GalleryMultiForm: React.FC<GalleryMultiFormProps> = ({
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("gallery");

  const [formData, setFormData] = useState({
    category: "",
    type: "image",
    title_tr: "",
    title_en: "",
    title_de: "",
    desc_tr: "",
    desc_en: "",
    desc_de: "",
    order: "1",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requiredFields = [
    "category",
    "type",
    "title_tr",
    "title_en",
    "title_de",
  ];
  const isSingleImageCategory =
    formData.category.toLowerCase() === "hero" ||
    formData.category.toLowerCase() === "cover";

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
      setFormData({
        category: "",
        type: "image",
        title_tr: "",
        title_en: "",
        title_de: "",
        desc_tr: "",
        desc_en: "",
        desc_de: "",
        order: "1",
      });
      setFiles([]);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      toast.error((err as any)?.message || t("upload.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{t("form.title")}</Title>

      <label htmlFor="category">{t("form.category")}</label>
      <Select
        id="category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="">{t("form.selectCategory")}</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>

      <label htmlFor="type">{t("form.type")}</label>
      <Select
        id="type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </Select>

      <label htmlFor="title_tr">{t("form.title_tr")}</label>
      <StyledInput
        id="title_tr"
        type="text"
        placeholder={t("form.title_tr")}
        value={formData.title_tr}
        onChange={(e) => setFormData({ ...formData, title_tr: e.target.value })}
      />

      <label htmlFor="title_en">{t("form.title_en")}</label>
      <StyledInput
        id="title_en"
        type="text"
        placeholder={t("form.title_en")}
        value={formData.title_en}
        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
      />

      <label htmlFor="title_de">{t("form.title_de")}</label>
      <StyledInput
        id="title_de"
        type="text"
        placeholder={t("form.title_de")}
        value={formData.title_de}
        onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
      />

      <label htmlFor="desc_tr">{t("form.desc_tr")}</label>
      <TextArea
        id="desc_tr"
        placeholder={t("form.desc_tr")}
        value={formData.desc_tr}
        onChange={(e) => setFormData({ ...formData, desc_tr: e.target.value })}
      />

      <label htmlFor="desc_en">{t("form.desc_en")}</label>
      <TextArea
        id="desc_en"
        placeholder={t("form.desc_en")}
        value={formData.desc_en}
        onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
      />

      <label htmlFor="desc_de">{t("form.desc_de")}</label>
      <TextArea
        id="desc_de"
        placeholder={t("form.desc_de")}
        value={formData.desc_de}
        onChange={(e) => setFormData({ ...formData, desc_de: e.target.value })}
      />

      <label htmlFor="order">{t("form.order")}</label>
      <StyledInput
        id="order"
        type="number"
        placeholder={t("form.order")}
        value={formData.order}
        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
      />

      <ImageUploadWithPreview
        max={isSingleImageCategory ? 1 : 10}
        folder="gallery"
        onChange={(selectedFiles) => setFiles(selectedFiles)}
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
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  max-width: 600px;
  margin: auto;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
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
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
