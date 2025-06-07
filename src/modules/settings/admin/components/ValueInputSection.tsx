"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  AdminSiteTemplateSelector,
  NestedValueEditor,
  NestedSocialLinksEditor,
  MultiLangObjectEditor,
} from "@/modules/settings";
import { upsertSetting } from "@/modules/settings/slice/settingSlice";
import { AppDispatch } from "@/store";

interface Props {
  keyValue: string;
  value: any;
  setValue: (val: any) => void;
  availableThemes: string[];
  onAvailableThemesUpdate: (newThemes: string[]) => void;
  dispatch: AppDispatch;
  isMultiLang: boolean;
  isNestedObject: boolean;
  isImage: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
  lightFile?: File | null;
  setLightFile?: (f: File | null) => void;
  darkFile?: File | null;
  setDarkFile?: (f: File | null) => void;
  isEditing?: boolean; // <-- EDIT MODU EKLENDİ!
}

export default function ValueInputSection({
  keyValue,
  value,
  setValue,
  availableThemes,
  onAvailableThemesUpdate,
  dispatch,
  isMultiLang,
  isNestedObject,
  isImage,
  file,
  setFile,
  lightFile,
  setLightFile,
  darkFile,
  setDarkFile,
  isEditing = false, // default
}: Props) {
  const { t } = useTranslation("settings");
  const isLogoUpload =
    keyValue === "navbar_logos" || keyValue === "footer_logos";

  // Edit modunda, hangi tip geldiyse sadece o input renderlanır!
  // (Çakışan tipler false olur ve UI'da input çıkmaz.)

  // Çoklu Dil Object (ör: navbar_logo_text)
  if (
    keyValue === "navbar_logo_text" &&
    isMultiLang &&
    !isNestedObject &&
    !isImage
  ) {
    const safeVal = typeof value === "object" && value !== null ? value : {};
    return <MultiLangObjectEditor value={safeVal} setValue={setValue} />;
  }

  // Logo (Light/Dark) Upload
  if (isLogoUpload && !isMultiLang && !isNestedObject && !isImage) {
    return (
      <LogoUploadWrapper>
        <div>
          <Label>{t("lightLogo", "Light Logo")}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={
              isEditing
                ? undefined
                : (e) => setLightFile?.(e.target.files?.[0] || null)
            }
            disabled={isEditing}
          />
          {lightFile && <FileInfo>{lightFile.name}</FileInfo>}
        </div>
        <div>
          <Label>{t("darkLogo", "Dark Logo")}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={
              isEditing
                ? undefined
                : (e) => setDarkFile?.(e.target.files?.[0] || null)
            }
            disabled={isEditing}
          />
          {darkFile && <FileInfo>{darkFile.name}</FileInfo>}
        </div>
      </LogoUploadWrapper>
    );
  }

  // Tekil Image Upload
  if (isImage && !isMultiLang && !isNestedObject && !isLogoUpload) {
    return (
      <>
        <Label>{t("uploadImage", "Upload Image")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={
            isEditing ? undefined : (e) => setFile(e.target.files?.[0] || null)
          }
          disabled={isEditing}
        />
        {file && <FileInfo>{file.name}</FileInfo>}
      </>
    );
  }

  // Tema Listesi
  if (
    keyValue === "available_themes" &&
    !isImage &&
    !isMultiLang &&
    !isNestedObject &&
    !isLogoUpload
  ) {
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

  // Tema Seçimi
  if (
    keyValue === "site_template" &&
    !isImage &&
    !isMultiLang &&
    !isNestedObject &&
    !isLogoUpload
  ) {
    return (
      <>
        <Label>{t("selectTheme", "Select Theme")}</Label>
        <AdminSiteTemplateSelector
          availableThemes={availableThemes}
          selectedTheme={value}
          onChange={isEditing ? () => {} : setValue}
          onAddTheme={
            isEditing
              ? () => {}
              : (newTheme) => {
                  const trimmed = newTheme.trim();
                  if (!trimmed || availableThemes.includes(trimmed)) return;
                  const updatedThemes = [...availableThemes, trimmed];
                  onAvailableThemesUpdate(updatedThemes);
                  dispatch(
                    upsertSetting({
                      key: "available_themes",
                      value: updatedThemes,
                    })
                  );
                  setValue(trimmed);
                }
          }
          onDeleteTheme={
            isEditing
              ? () => {}
              : (themeToDelete) => {
                  const updatedThemes = availableThemes.filter(
                    (t) => t !== themeToDelete
                  );
                  onAvailableThemesUpdate(updatedThemes);
                  dispatch(
                    upsertSetting({
                      key: "available_themes",
                      value: updatedThemes,
                    })
                  );
                  if (value === themeToDelete) setValue("");
                }
          }
        />
      </>
    );
  }

  // Sosyal Linkler
  if (
    keyValue === "footer_social_links" &&
    isNestedObject &&
    !isImage &&
    !isMultiLang
  ) {
    const socialLinks =
      typeof value === "object" && !Array.isArray(value) ? value : {};
    return <NestedSocialLinksEditor value={socialLinks} setValue={setValue} />;
  }

  // Nested Object (örn: footer_links)
  if (isNestedObject && !isMultiLang && !isImage && !isLogoUpload) {
    const nestedValue =
      typeof value === "object" && value !== null ? value : {};
    return <NestedValueEditor value={nestedValue} setValue={setValue} />;
  }

  // Çoklu Dil (tr, en, de)
  if (isMultiLang && !isNestedObject && !isImage && !isLogoUpload) {
    const val =
      typeof value === "object" && value !== null
        ? value
        : { tr: "", en: "", de: "" };
    return (
      <>
        <Label>{t("valueTr", "Value (Turkish)")}</Label>
        <Input
          value={val.tr || ""}
          onChange={(e) => setValue({ ...val, tr: e.target.value })}
          disabled={isEditing}
        />
        <Label>{t("valueEn", "Value (English)")}</Label>
        <Input
          value={val.en || ""}
          onChange={(e) => setValue({ ...val, en: e.target.value })}
          disabled={isEditing}
        />
        <Label>{t("valueDe", "Value (German)")}</Label>
        <Input
          value={val.de || ""}
          onChange={(e) => setValue({ ...val, de: e.target.value })}
          disabled={isEditing}
        />
      </>
    );
  }

  // Default: Tek Satırlık String Value
  if (!isImage && !isMultiLang && !isNestedObject && !isLogoUpload) {
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
  }

  // --- Eğer inputu hiç renderlamaması gereken bir durumda iseniz, sadece bilgi gösterin:
  return (
    <ReadOnlyMessage>
      {t("notEditable", "This field type cannot be edited.")}
    </ReadOnlyMessage>
  );
}

// 🎨 Styled Components
const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
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

const FileInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LogoUploadWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  > div {
    flex: 1 1 200px;
  }
`;

const ReadOnlyMessage = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;
