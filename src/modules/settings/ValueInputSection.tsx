"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import AdminSiteTemplateSelector from "./AdminSiteTemplateSelector";
import NestedValueEditor from "./NestedValueEditor";
import NestedSocialLinksEditor from "./NestedSocialLinksEditor"; // ✅ YENİ
import { upsertSetting } from "@/store/settingSlice";
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
          value={
            Array.isArray(value) ? value.join(", ") : (value as string) || ""
          }
          onChange={(e) => setValue(e.target.value)}
          placeholder="classic, modern, minimal"
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
          selectedTheme={value as string}
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
              (theme) => theme !== themeToDelete
            );
            onAvailableThemesUpdate(updatedThemes);
            dispatch(
              upsertSetting({ key: "available_themes", value: updatedThemes })
            );
            if (value === themeToDelete) {
              setValue("");
            }
          }}
        />
      </>
    );
  }

  // ✅ Özel: footer_social_links
  if (keyValue === "footer_social_links") {
    const socialLinksValue =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, { url: string; icon: string }>)
        : {};

    return (
      <NestedSocialLinksEditor
        value={socialLinksValue}
        setValue={(v) => setValue(v)}
      />
    );
  }

  // ✅ Nested Object (about_links gibi)
  if (isNestedObject) {
    const nestedValue =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<
            string,
            { label: { tr: string; en: string; de: string }; url: string }
          >)
        : {};

    return (
      <NestedValueEditor value={nestedValue} setValue={(v) => setValue(v)} />
    );
  }

  // ✅ Multi Lang klasik hali
  if (isMultiLang) {
    let val: { tr: string; en: string; de: string } = {
      tr: "",
      en: "",
      de: "",
    };

    if (typeof value === "object" && value !== null) {
      val = {
        tr: value.tr ?? "",
        en: value.en ?? "",
        de: value.de ?? "",
      };
    } else if (typeof value === "string") {
      // Eğer yanlışlıkla string gelirse tüm dillere aynı atanabilir
      val = { tr: value, en: value, de: value };
    }

    return (
      <>
        <Label>{t("valueTr", "Value (Turkish)")}</Label>
        <Input
          value={val.tr}
          onChange={(e) => setValue({ ...val, tr: e.target.value })}
        />
        <Label>{t("valueEn", "Value (English)")}</Label>
        <Input
          value={val.en}
          onChange={(e) => setValue({ ...val, en: e.target.value })}
        />
        <Label>{t("valueDe", "Value (German)")}</Label>
        <Input
          value={val.de}
          onChange={(e) => setValue({ ...val, de: e.target.value })}
        />
      </>
    );
  }

  // ✅ Düz string değer
  return (
    <>
      <Label>{t("value", "Value")}</Label>
      <Input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setValue(e.target.value ?? "")}
        placeholder={t("valuePlaceholder", "Enter value")}
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
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const FileInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
