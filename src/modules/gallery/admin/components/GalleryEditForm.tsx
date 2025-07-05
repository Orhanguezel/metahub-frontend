"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import { ImageUploadWithPreview } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

import type { SupportedLocale } from "@/types/common";
import type { IGalleryCategory, IGallery } from "@/modules/gallery/types";
import { SUPPORTED_LOCALES } from "@/types/common";

interface EditFormState {
  category: string;
  type: "image" | "video";
  order: string;
  [key: string]: string;
}

interface GalleryEditFormProps {
  item: IGallery; // ✅ doğru prop adı
  onClose: () => void;
  categories: IGalleryCategory[];
}

const tabs = ["general", "titles", "descriptions", "image"] as const;

const GalleryEditForm: React.FC<GalleryEditFormProps> = ({
  item,
  onClose,
  categories,
}) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const defaultImages = useMemo(
    () =>
      item.images.map((i) => i.thumbnail || i.url).filter(Boolean),
    [item]
  );

  const firstItem = item.images?.[0] ?? {
    url: "",
    name: {},
    description: {},
    order: 1,
  };

  const [formState, setFormState] = useState<EditFormState>(() => {
    const state: EditFormState = {
      category:
        typeof item.category === "string"
          ? item.category
          : (item.category as IGalleryCategory)?._id ?? "",
      type: item.type,
      order: firstItem.order?.toString() || "1",
    };

    SUPPORTED_LOCALES.forEach((lng) => {
      state[`title_${lng}`] = firstItem.name?.[lng] ?? "";
      state[`desc_${lng}`] = firstItem.description?.[lng] ?? "";
    });

    return state;
  });

  const [files, setFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const inputRefs = {
    general: useRef<HTMLSelectElement>(null),
    titles: useRef<HTMLInputElement>(null),
    descriptions: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    if (activeTab === "general") inputRefs.general.current?.focus();
    else if (activeTab === "titles") inputRefs.titles.current?.focus();
    else if (activeTab === "descriptions") inputRefs.descriptions.current?.focus();
  }, [activeTab]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.category) newErrors.category = t("errors.requiredCategory");

    if (!formState[`title_${lang}`])
      newErrors[`title_${lang}`] = t(`errors.requiredTitle_${lang}`);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    removedImages.forEach((url) => data.append("removedImages[]", url));
    files.forEach((file) => data.append("images", file));

    try {
      setIsLoading(true);
      await dispatch(updateGalleryItem({ id: item._id, formData: data })).unwrap();
      setSuccess(true);
      toast.success(t("update.success"));
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      toast.error((err as any)?.message || t("upload.error"));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Form onSubmit={handleSubmit}>
      <TabList>
        {tabs.map((tab) => (
          <Tab
            key={tab}
            type="button"
            $isActive={activeTab === tab}
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
              ref={inputRefs.general}
              value={formState.category}
              onChange={(e) =>
                setFormState({ ...formState, category: e.target.value })
              }
            >
              <option value="">{t("form.selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name?.[lang] ?? cat.slug}
                </option>
              ))}
            </Select>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}

            <Label>{t("form.type")}</Label>
            <Select
              value={formState.type}
              onChange={(e) =>
                setFormState({ ...formState, type: e.target.value as "image" | "video" })
              }
            >
              <option value="image">{t("form.type_image")}</option>
              <option value="video">{t("form.type_video")}</option>
            </Select>

            <Label>{t("form.order")}</Label>
            <StyledInput
              type="number"
              value={formState.order}
              onChange={(e) =>
                setFormState({ ...formState, order: e.target.value })
              }
            />
          </Section>
        )}

        {activeTab === "titles" && (
          <Section $animate>
            {SUPPORTED_LOCALES.map((lng) => (
              <div key={lng}>
                <Label>{t(`form.title_${lng}`)}</Label>
                <StyledInput
                  ref={lng === lang ? inputRefs.titles : undefined}
                  value={formState[`title_${lng}`]}
                  onChange={(e) =>
                    setFormState({ ...formState, [`title_${lng}`]: e.target.value })
                  }
                />
                {errors[`title_${lng}`] && (
                  <ErrorText>{errors[`title_${lng}`]}</ErrorText>
                )}
              </div>
            ))}
          </Section>
        )}

        {activeTab === "descriptions" && (
          <Section $animate>
            {SUPPORTED_LOCALES.map((lng) => (
              <div key={lng}>
                <Label>{t(`form.desc_${lng}`)}</Label>
                <TextArea
                  ref={lng === lang ? inputRefs.descriptions : undefined}
                  value={formState[`desc_${lng}`]}
                  onChange={(e) =>
                    setFormState({ ...formState, [`desc_${lng}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </Section>
        )}

        {activeTab === "image" && (
          <Section $animate>
            <ImageUploadWithPreview
              folder="gallery"
              max={5}
              defaultImages={defaultImages}
              onChange={(files, removed) => {
                setFiles(files);
                setRemovedImages(removed);
              }}
            />
          </Section>
        )}
      </TabContent>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? <Spinner /> : success ? "✓" : t("form.save")}
      </SubmitButton>
    </Form>
  );
};

export default GalleryEditForm;


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
  gap: ${({ theme }) => theme.spacings.lg};
  padding: ${({ theme }) => theme.spacings.xl};
  min-width: 340px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
    max-width: 100%;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;

export const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

export const Tab = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
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
  letter-spacings: 0.01em;
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
  gap: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.sm};
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
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

export const Select = styled.select`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  &:focus {
    border: ${({ theme }) => theme.borders.thick}
      ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    outline: none;
  }
`;

export const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
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
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    outline: none;
  }
`;

export const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  resize: vertical;
  min-height: 80px;
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
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
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
  margin-bottom: ${({ theme }) => theme.spacings.sm};
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
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

export const SubmitButton = styled.button`
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
