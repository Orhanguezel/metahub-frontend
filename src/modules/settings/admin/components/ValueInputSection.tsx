"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import {
  NestedValueEditor,
  NestedSocialLinksEditor,
  MultiLangObjectEditor,
} from "@/modules/settings";
import { SUPPORTED_LOCALES } from "@/i18n";
import { completeLocales } from "@/utils/completeLocales";

// Props tipi
interface ValueInputSectionProps {
  keyValue: string;
  value: any;
  setValue: (v: any) => void;
  availableThemes?: string[];
  isMultiLang: boolean;
  isNestedObject: boolean;
  isImage: boolean;
  file?: File | null;
  setFile?: (f: File | null) => void;
  lightFile?: File | null;
  setLightFile?: (f: File | null) => void;
  darkFile?: File | null;
  setDarkFile?: (f: File | null) => void;
  isEditing?: boolean;
  supportedLocales?: readonly string[];
}

const ValueInputSection: React.FC<ValueInputSectionProps> = ({
  keyValue,
  value,
  setValue,
  availableThemes,
  isMultiLang,
  isNestedObject,
  isImage,
  file,
  setFile,
  lightFile,
  setLightFile,
  darkFile,
  setDarkFile,
  isEditing = false,
  supportedLocales = SUPPORTED_LOCALES,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const isLogoUpload =
    keyValue === "navbar_logos" || keyValue === "footer_logos";

  // MultiLang normalizasyon
  useEffect(() => {
    if (
      isMultiLang &&
      !isNestedObject &&
      !isImage &&
      !isLogoUpload &&
      typeof value === "object" &&
      value !== null
    ) {
      setValue(completeLocales(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiLang, isNestedObject, isImage, isLogoUpload, keyValue]);

  // MultiLang (tek katmanlı)
  if (isMultiLang && !isNestedObject && !isImage && !isLogoUpload) {
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
              disabled={isEditing}
            />
          </div>
        ))}
      </>
    );
  }

  // MultiLang Nested Object (navbar_logo_text, footer_contact, footer_label)
  if (
    (keyValue === "navbar_logo_text" ||
      keyValue === "footer_contact" ||
      keyValue === "footer_label") &&
    isMultiLang &&
    !isNestedObject &&
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

  // Logo Upload (light/dark)
  if (isLogoUpload && !isMultiLang && !isNestedObject && !isImage) {
    return (
      <LogoUploadWrapper>
        <div>
          <Label>{t("lightLogo", "Light Logo")}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setLightFile && setLightFile(e.target.files?.[0] || null)}
            disabled={isEditing}
          />
          {lightFile && <FileInfo>{lightFile.name}</FileInfo>}
        </div>
        <div>
          <Label>{t("darkLogo", "Dark Logo")}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setDarkFile && setDarkFile(e.target.files?.[0] || null)}
            disabled={isEditing}
          />
          {darkFile && <FileInfo>{darkFile.name}</FileInfo>}
        </div>
      </LogoUploadWrapper>
    );
  }

  // Single Image Upload
  if (isImage && !isMultiLang && !isNestedObject && !isLogoUpload) {
    return (
      <>
        <Label>{t("uploadImage", "Upload Image")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile && setFile(e.target.files?.[0] || null)}
          disabled={isEditing}
        />
        {file && <FileInfo>{file.name}</FileInfo>}
      </>
    );
  }

  // Available Themes (comma separated list)
  if (keyValue === "available_themes") {
    return (
      <>
        <Label>{t("themeList", "Theme List (comma separated)")}</Label>
        <Input
          type="text"
          value={Array.isArray(value) ? value.join(", ") : value || ""}
          onChange={(e) => setValue(e.target.value)}
          disabled={isEditing}
        />
      </>
    );
  }

  // Theme Selection (site_template)
  if (keyValue === "site_template") {
    return (
      <>
        <Label>{t("selectTheme", "Select Theme")}</Label>
        <Select
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          disabled={isEditing || !availableThemes?.length}
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

  // Footer Social Links
  if (keyValue === "footer_social_links" && isNestedObject) {
    const socialLinks =
      typeof value === "object" && !Array.isArray(value) ? value : {};
    return (
      <NestedSocialLinksEditor
        value={socialLinks}
        setValue={setValue}
      />
    );
  }

  // Generic Nested Object
  if (isNestedObject && !isMultiLang && !isImage && !isLogoUpload) {
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

  // Plain String Input
  return (
    <>
      <Label>{t("value", "Value")}</Label>
      <Input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setValue(e.target.value)}
        disabled={isEditing}
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

const FileInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LogoUploadWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  flex-wrap: wrap;
  > div {
    flex: 1 1 200px;
  }
`;
