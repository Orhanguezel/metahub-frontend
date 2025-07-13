"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import {
  NestedValueEditor,
  MultiLangObjectEditor,
} from "@/modules/settings";
import { SUPPORTED_LOCALES } from "@/i18n";
import { completeLocales } from "@/utils/completeLocales";

// Çoklu görsel destekleyen keyler
const IMAGE_KEYS = [
  "navbar_images",
  "footer_images",
  "logo_images",
  "images",
];
const MULTILANG_OBJECT_KEYS = [
  "navbar_logo_text",
  "footer_contact",
  "footer_label",
];

interface ValueInputSectionProps {
  keyValue: string;
  value: any;
  setValue: (v: any) => void;
  availableThemes?: string[];
  isMultiLang: boolean;
  isNestedObject: boolean;
  isImage: boolean;
  supportedLocales?: readonly string[];
  files?: File[];
  setFiles?: (files: File[]) => void;
  removedImages?: string[];
  setRemovedImages?: (ids: string[]) => void;
}

const ValueInputSection: React.FC<ValueInputSectionProps> = ({
  keyValue,
  value,
  setValue,
  availableThemes,
  isMultiLang,
  isNestedObject,
  isImage,
  supportedLocales = SUPPORTED_LOCALES,
  files = [],
  setFiles,
  removedImages = [],
  setRemovedImages,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const isImageKey = IMAGE_KEYS.includes(keyValue);

  // MultiLang normalizasyon
  useEffect(() => {
    if (
      isMultiLang &&
      !isNestedObject &&
      !isImage &&
      !isImageKey &&
      typeof value === "object" &&
      value !== null
    ) {
      setValue(completeLocales(value));
    }
    // eslint-disable-next-line
  }, [isMultiLang, isNestedObject, isImage, isImageKey, keyValue]);

  // 1) MultiLang (tek katmanlı TranslatedLabel)
  if (isMultiLang && !isNestedObject && !isImage && !isImageKey) {
    const val =
      typeof value === "object" && value !== null
        ? completeLocales(value)
        : supportedLocales.reduce(
            (acc, lng) => ({ ...acc, [lng]: "" }),
            {} as Record<string, string>
          );
    return (
      <>
        {supportedLocales.map((lng) => (
          <div key={lng}>
            <Label>
              {t("value", "Value")} ({lng.toUpperCase()})
            </Label>
            <Input
              value={val[lng] || ""}
              onChange={(e) => setValue({ ...val, [lng]: e.target.value })}
            />
          </div>
        ))}
      </>
    );
  }

  // 2) MultiLang Nested Object (örn: navbar_logo_text) **DÜZELTİLDİ**
  if (
    MULTILANG_OBJECT_KEYS.includes(keyValue) &&
    isMultiLang &&
    isNestedObject &&        // <-- burada !isNestedObject yerine isNestedObject olmalı
    !isImage
  ) {
    const safeVal = typeof value === "object" && value !== null ? value : {};
    return (
      <MultiLangObjectEditor
        value={safeVal}
        setValue={setValue}
        supportedLocales={supportedLocales}
      />
    );
  }

  // 3) Çoklu image upload (logo, navbar, footer, images vs)
  if (isImageKey && !isMultiLang && !isNestedObject) {
    // Mevcut görselleri (API’den gelen value) ve yeni yüklenen dosyaları (files) göster
    const currentImages = (value && Array.isArray(value) ? value : value?.images) || [];
    const handleRemoveImage = (img: any) => {
      if ((img.publicId || img._id) && setRemovedImages) {
        setRemovedImages([...(removedImages || []), img.publicId || img._id]);
      }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFiles?.(e.target.files ? Array.from(e.target.files) : []);
    };

    return (
      <ImageWrapper>
        <Label>
          {t("images", "Images")}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </Label>
        <ImagePreviews>
          {/* Mevcut görseller (kaldırılabilir) */}
          {currentImages
            .filter(
              (img: any) =>
                !removedImages?.includes(img.publicId || img._id || "")
            )
            .map((img: any, idx: number) => (
              <PreviewBox key={img.publicId || img._id || img.url || idx}>
                <PreviewImg src={img.url} alt={img.publicId || img._id || `img-${idx}`} />
                {setRemovedImages && (
                  <RemoveImgBtn
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                  >
                    ×
                  </RemoveImgBtn>
                )}
              </PreviewBox>
            ))}
          {/* Yeni eklenen dosyalar (henüz yüklenmemiş) */}
          {files?.map((file, idx) => (
            <PreviewBox key={file.name + idx}>
              <PreviewImg src={URL.createObjectURL(file)} alt={file.name} />
            </PreviewBox>
          ))}
        </ImagePreviews>
      </ImageWrapper>
    );
  }

  // 4) Available Themes (comma separated veya array)
  if (keyValue === "available_themes") {
    return (
      <>
        <Label>{t("themeList", "Theme List (comma separated)")}</Label>
        <Input
          type="text"
          value={Array.isArray(value) ? value.join(", ") : value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      </>
    );
  }

  // 5) Theme Selection (site_template)
  if (keyValue === "site_template") {
    return (
      <>
        <Label>{t("selectTheme", "Select Theme")}</Label>
        <Select
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          disabled={!availableThemes?.length}
        >
          <option value="" disabled>
            {t("selectTheme", "Select Theme")}
          </option>
          {(availableThemes || []).map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </Select>
      </>
    );
  }

  // 6) Generic Nested Object (herhangi bir anahtar için json object)
  if (isNestedObject && !isMultiLang && !isImage && !isImageKey) {
    const nestedValue =
      typeof value === "object" && value !== null ? value : {};
    return (
      <NestedValueEditor
        value={nestedValue}
        setValue={setValue}
        supportedLocales={supportedLocales}
      />
    );
  }

  // 7) Plain String Input (default fallback)
  return (
    <>
      <Label>{t("value", "Value")}</Label>
      <Input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
};

export default ValueInputSection;

// --- Styled Components ---
const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 100%;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const ImagePreviews = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const PreviewBox = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImg = styled.img`
  margin-top: ${({ theme }) => theme.spacings.xs};
  max-width: 120px;
  max-height: 80px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  object-fit: contain;
`;

const RemoveImgBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.11);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  &:hover {
    background: #f5222d;
  }
`;
