import React, { useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { uploadGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { css } from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { translations } from "@/modules/gallery";
import { toast } from "react-toastify";
import { GalleryUploadWithPreview } from "@/shared";
import type { IGalleryCategory,IGalleryItem } from "@/modules/gallery/types";

interface GalleryMultiFormProps {
  categories: IGalleryCategory[];
  onUpdate?: () => void;
}

const initialName = SUPPORTED_LOCALES.reduce(
  (acc, lng) => ({ ...acc, [lng]: "" }),
  {} as Record<SupportedLocale, string>
);

const initialDescription = SUPPORTED_LOCALES.reduce(
  (acc, lng) => ({ ...acc, [lng]: "" }),
  {} as Record<SupportedLocale, string>
);

const GalleryMultiForm: React.FC<GalleryMultiFormProps> = ({
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Form state
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [order, setOrder] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<IGalleryItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedCategory = categories.find((cat) => cat._id === category);
  const isSingleImageCategory =
    selectedCategory && (selectedCategory.slug === "hero" || selectedCategory.slug === "cover");

  // Çoklu dosya seçimini handle eden method
  const handleImagesChange = useCallback(
  (files: File[], _removed: string[], current: IGalleryItem[]) => {
    setSelectedFiles(files);
    setExistingImages(current);
  },
  []
);

  // Submit logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !type || !name[lang]?.trim() || selectedFiles.length === 0) {
      toast.error(t("errors.requiredFields") || "Please fill required fields and select at least one image.");
      return;
    }

    // Tüm dilleri otomatik doldur
    const filledName = { ...name };
    SUPPORTED_LOCALES.forEach((l) => {
      if (!filledName[l]) filledName[l] = name[lang];
    });

    const filledDescription = { ...description };
    SUPPORTED_LOCALES.forEach((l) => {
      if (!filledDescription[l]) filledDescription[l] = description[lang] || "";
    });

    const data = new FormData();
data.append("category", category);
data.append("type", type);
data.append("order", order);
data.append("name", JSON.stringify(filledName));
data.append("description", JSON.stringify(filledDescription));
selectedFiles.forEach((file) => data.append("images", file));
if (existingImages.length) {
  data.append("existingImages", JSON.stringify(existingImages));
}

    try {
      setIsLoading(true);
      await dispatch(uploadGalleryItem(data)).unwrap();
      toast.success(t("upload.success"));
      setCategory("");
      setType("image");
      setName(initialName);
      setDescription(initialDescription);
      setOrder("1");
      setSelectedFiles([]);
      setExistingImages([]);
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
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">{t("form.selectCategory")}</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name?.[lang] || cat.slug}
          </option>
        ))}
      </Select>

      <label htmlFor="type">{t("form.type")}</label>
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
          <label>
            {t("form.name", "Name")} ({lng.toUpperCase()})
          </label>
          <StyledInput
            type="text"
            value={name[lng]}
            onChange={(e) => setName({ ...name, [lng]: e.target.value })}
            required={lng === lang}
          />
          <label>
            {t("form.description", "Description")} ({lng.toUpperCase()})
          </label>
          <TextArea
            value={description[lng]}
            onChange={(e) =>
              setDescription({ ...description, [lng]: e.target.value })
            }
          />
        </div>
      ))}

      <label htmlFor="order">{t("form.order")}</label>
      <StyledInput
        id="order"
        type="number"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        min={1}
      />

      <GalleryUploadWithPreview
  max={isSingleImageCategory ? 1 : 10}
  folder="gallery"
  defaultImages={existingImages}
  onChange={handleImagesChange}
/>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? t("form.loading") : t("form.submit")}
      </SubmitButton>
    </Form>
  );
};

export default GalleryMultiForm;

// --- Styled Components aşağıda değişmeden bırakabilirsin. ---
const inputStyles = css`
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  transition: border ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
  &:focus {
    border: ${({ theme }) => theme.borders.thick}
      ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.lg};
  max-width: 540px;
  margin: 0 auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

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
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacings.lg};
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

export { Form, Title, StyledInput, Select, TextArea, SubmitButton };
