"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { ImageUploadWithPreview } from "@/shared";
import type {
  GalleryCategory,
  GalleryItem,
} from "@/modules/gallery/types/gallery";

type Lang = "tr" | "en" | "de";

interface EditFormState {
  category: string;
  type: string;
  title_tr: string;
  title_en: string;
  title_de: string;
  desc_tr: string;
  desc_en: string;
  desc_de: string;
  order: string;
}

interface GalleryEditFormProps {
  item: GalleryItem;
  onClose: () => void;
  categories: GalleryCategory[];
}

const tabs = ["general", "titles", "descriptions", "image"] as const;

const GalleryEditForm: React.FC<GalleryEditFormProps> = ({
  item,
  onClose,
  categories,
}) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("gallery");

  // --- Dil anahtarını güvenli şekilde seç
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "tr"
  ) as Lang;

  const firstItem = item.items[0] || {
    image: "",
    title: { tr: "", en: "", de: "" },
    description: { tr: "", en: "", de: "" },
    order: 1,
  };

  const [formState, setFormState] = useState<EditFormState>({
    category:
      typeof item.category === "string"
        ? item.category
        : (item.category as GalleryCategory)?._id || "",
    type: item.type,
    title_tr: firstItem.title.tr,
    title_en: firstItem.title.en,
    title_de: firstItem.title.de,
    desc_tr: firstItem.description?.tr || "",
    desc_en: firstItem.description?.en || "",
    desc_de: firstItem.description?.de || "",
    order: firstItem.order?.toString() || "1",
  });

  // ---- IMAGE STATES ----
  const defaultImages = (item.items ?? [])
    .map((i) => i.image)
    .filter(Boolean);

  const [files, setFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  // ----------------------

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("general");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Ref odak
  const generalSelectRef = useRef<HTMLSelectElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === "general") generalSelectRef.current?.focus();
    else if (activeTab === "titles") titleInputRef.current?.focus();
    else if (activeTab === "descriptions")
      descriptionTextAreaRef.current?.focus();
  }, [activeTab]);

  // Validasyon
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.category) newErrors.category = t("errors.requiredCategory");
    if (!formState.title_tr) newErrors.title_tr = t("errors.requiredTitleTr");
    if (!formState.title_en) newErrors.title_en = t("errors.requiredTitleEn");
    if (!formState.title_de) newErrors.title_de = t("errors.requiredTitleDe");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kaydet
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (typeof value === "string" && value !== "") {
        data.append(key, value);
      }
    });
    // Removed images ve yeni dosyalar ekleniyor
    removedImages.forEach((url) => data.append("removedImages[]", url));
    files.forEach((file) => data.append("images", file));

    try {
      setIsLoading(true);
      await dispatch(
        updateGalleryItem({ id: item._id, formData: data })
      ).unwrap();
      setSuccess(true);
      toast.success(t("update.success"));
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      toast.error((err as any)?.message || t("upload.error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Resim değişikliği callback'i
  const handleImageChange = (
  files: File[],
  removed: string[],
  _current: string[]
) => {
  setFiles(files);
  setRemovedImages(removed);
};


  return (
    <Form onSubmit={handleSubmit}>
      {/* Tablar */}
      <TabList role="tablist">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            type="button"
            $isActive={activeTab === tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {t(`form.${tab}`)}
          </Tab>
        ))}
      </TabList>

      <TabContent>
        {activeTab === "general" && (
          <Section $animate>
            <Label>{t("form.category")}</Label>
            <Select
              ref={generalSelectRef}
              value={formState.category}
              onChange={(e) =>
                setFormState({ ...formState, category: e.target.value })
              }
            >
              <option value="">{t("form.selectCategory")}</option>
              {categories.length === 0 ? (
                <option disabled>{t("form.noCategories")}</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name?.[lang] || cat.slug}
                  </option>
                ))
              )}
            </Select>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}

            <Label>{t("form.type")}</Label>
            <Select
              value={formState.type}
              onChange={(e) =>
                setFormState({ ...formState, type: e.target.value })
              }
            >
              <option value="image">{t("form.type_image")}</option>
              <option value="video">{t("form.type_video")}</option>
            </Select>

            <Label>{t("form.order")}</Label>
            <StyledInput
              type="number"
              placeholder={t("form.order")}
              value={formState.order}
              onChange={(e) =>
                setFormState({ ...formState, order: e.target.value })
              }
            />
          </Section>
        )}

        {activeTab === "titles" && (
          <Section $animate>
            <Label>{t("form.title_tr")}</Label>
            <StyledInput
              ref={titleInputRef}
              type="text"
              placeholder={t("form.title_tr")}
              value={formState.title_tr}
              onChange={(e) =>
                setFormState({ ...formState, title_tr: e.target.value })
              }
            />
            {errors.title_tr && <ErrorText>{errors.title_tr}</ErrorText>}

            <Label>{t("form.title_en")}</Label>
            <StyledInput
              type="text"
              placeholder={t("form.title_en")}
              value={formState.title_en}
              onChange={(e) =>
                setFormState({ ...formState, title_en: e.target.value })
              }
            />
            {errors.title_en && <ErrorText>{errors.title_en}</ErrorText>}

            <Label>{t("form.title_de")}</Label>
            <StyledInput
              type="text"
              placeholder={t("form.title_de")}
              value={formState.title_de}
              onChange={(e) =>
                setFormState({ ...formState, title_de: e.target.value })
              }
            />
            {errors.title_de && <ErrorText>{errors.title_de}</ErrorText>}
          </Section>
        )}

        {activeTab === "descriptions" && (
          <Section $animate>
            <Label>{t("form.desc_tr")}</Label>
            <TextArea
              ref={descriptionTextAreaRef}
              placeholder={t("form.desc_tr")}
              value={formState.desc_tr}
              onChange={(e) =>
                setFormState({ ...formState, desc_tr: e.target.value })
              }
            />

            <Label>{t("form.desc_en")}</Label>
            <TextArea
              placeholder={t("form.desc_en")}
              value={formState.desc_en}
              onChange={(e) =>
                setFormState({ ...formState, desc_en: e.target.value })
              }
            />

            <Label>{t("form.desc_de")}</Label>
            <TextArea
              placeholder={t("form.desc_de")}
              value={formState.desc_de}
              onChange={(e) =>
                setFormState({ ...formState, desc_de: e.target.value })
              }
            />
          </Section>
        )}

        {activeTab === "image" && (
          <Section $animate>
            <SectionTitle>{t("form.currentImage")}</SectionTitle>
            {firstItem.image ? (
              <ImagePreview src={firstItem.image} alt="Current" />
            ) : (
              <Placeholder>{t("form.noImage")}</Placeholder>
            )}
            <SectionTitle>{t("form.uploadNew")}</SectionTitle>
            <ImageUploadWithPreview
              max={5}
              folder="gallery"
              defaultImages={defaultImages}
              onChange={handleImageChange}
            />
          </Section>
        )}
      </TabContent>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? <Spinner /> : success ? "✓ Saved!" : t("form.save")}
      </SubmitButton>
    </Form>
  );
};

export default GalleryEditForm;

// Styled Components (değişmedi)
// Animasyon
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Form = styled.form`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  min-width: 340px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    max-width: 100%;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Tab = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.buttonText : theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ $isActive, theme }) =>
    $isActive ? theme.fontWeights.bold : theme.fontWeights.medium};
  letter-spacing: 0.01em;
  box-shadow: ${({ $isActive, theme }) =>
    $isActive ? theme.shadows.button : "none"};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export const TabContent = styled.div`
  position: relative;
`;

export const Section = styled.div<{ $animate?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  animation: ${({ $animate }) => ($animate ? fadeIn : "none")} 0.3s ease;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    outline: none;
  }
`;

export const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    outline: none;
  }
`;

export const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  resize: vertical;
  min-height: 80px;
  transition: border ${({ theme }) => theme.transition.normal}, background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    outline: none;
  }
`;

export const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const Spinner = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.buttonText};
  border-top: 2px solid ${({ theme }) => theme.colors.primaryHover};
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: ${spin} 0.6s linear infinite;
  display: inline-block;
`;

export const ImagePreview = styled.img`
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const Placeholder = styled.div`
  width: 100%;
  height: 140px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const SubmitButton = styled.button`
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