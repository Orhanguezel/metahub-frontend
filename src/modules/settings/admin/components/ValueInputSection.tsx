"use client";


import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {AdminSiteTemplateSelector} from "@/modules/settings";
import {NestedValueEditor} from "@/modules/settings";
import {NestedSocialLinksEditor} from "@/modules/settings";
import {MultiLangObjectEditor} from "@/modules/settings";
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
}: Props) {
  const { t } = useTranslation("adminSettings");
  const isLogoUpload =
    keyValue === "navbar_logos" || keyValue === "footer_logos";

  // ✅ özel editor kontrolü
  if (keyValue === "navbar_logo_text") {
    const safeVal = typeof value === "object" && value !== null ? value : {};
    return <MultiLangObjectEditor value={safeVal} setValue={setValue} />;
  }

  if (isLogoUpload) {
    return (
      <>
        <Label>{t("lightLogo", "Light Logo")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setValue((prev: any) => ({
              ...prev,
              lightFile: e.target.files?.[0] || null,
            }))
          }
        />
        <Label>{t("darkLogo", "Dark Logo")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setValue((prev: any) => ({
              ...prev,
              darkFile: e.target.files?.[0] || null,
            }))
          }
        />
      </>
    );
  }

  if (isImage) {
    return (
      <>
        <Label>{t("uploadImage", "Upload Image")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && <FileInfo>{file.name}</FileInfo>}
      </>
    );
  }

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

  if (keyValue === "site_template") {
    return (
      <>
        <Label>{t("selectTheme", "Select Theme")}</Label>
        <AdminSiteTemplateSelector
          availableThemes={availableThemes}
          selectedTheme={value}
          onChange={setValue}
          onAddTheme={(newTheme) => {
            const trimmed = newTheme.trim();
            if (!trimmed || availableThemes.includes(trimmed)) return;
            const updatedThemes = [...availableThemes, trimmed];
            onAvailableThemesUpdate(updatedThemes);
            dispatch(
              upsertSetting({ key: "available_themes", value: updatedThemes })
            );
            setValue(trimmed);
          }}
          onDeleteTheme={(themeToDelete) => {
            const updatedThemes = availableThemes.filter(
              (t) => t !== themeToDelete
            );
            onAvailableThemesUpdate(updatedThemes);
            dispatch(
              upsertSetting({ key: "available_themes", value: updatedThemes })
            );
            if (value === themeToDelete) setValue("");
          }}
        />
      </>
    );
  }

  if (keyValue === "footer_social_links") {
    const socialLinks =
      typeof value === "object" && !Array.isArray(value) ? value : {};
    return <NestedSocialLinksEditor value={socialLinks} setValue={setValue} />;
  }

  if (isNestedObject) {
    const nestedValue =
      typeof value === "object" && value !== null ? value : {};
    return <NestedValueEditor value={nestedValue} setValue={setValue} />;
  }

  if (isMultiLang) {
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
        />
        <Label>{t("valueEn", "Value (English)")}</Label>
        <Input
          value={val.en || ""}
          onChange={(e) => setValue({ ...val, en: e.target.value })}
        />
        <Label>{t("valueDe", "Value (German)")}</Label>
        <Input
          value={val.de || ""}
          onChange={(e) => setValue({ ...val, de: e.target.value })}
        />
      </>
    );
  }

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
