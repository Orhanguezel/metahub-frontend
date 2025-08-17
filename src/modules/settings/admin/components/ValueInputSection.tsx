"use client";
import React, { useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import MultiLangObjectEditor from "@/modules/settings/admin/components/MultiLangObjectEditor";
import { SUPPORTED_LOCALES } from "@/i18n";
import { completeLocales } from "@/utils/completeLocales";
import { JSONEditor } from "@/shared";

const IMAGE_KEYS = ["navbar_images","footer_images","logo_images","images"];
const MULTILANG_OBJECT_KEYS = ["navbar_logo_text","footer_contact","footer_label"];

interface ValueInputSectionProps {
  keyValue: string;
  value: any;
  setValue: (v: any) => void;
  availableThemes?: string[];
  isMultiLang: boolean;
  isNestedObject: boolean;
  isImage: boolean;
  supportedLocales?: readonly string[];
  // image props üst formda yönetiliyor
  files?: File[];
  setFiles?: (files: File[]) => void;
  removedImages?: string[];
  setRemovedImages?: (ids: string[]) => void;
}

/** —— Tip sarmalayıcı (wrapper) —— 
 * Bazı projelerde barrel/circular export yüzünden MultiLangObjectEditor'ın
 * props tipi yanlış resolve olabiliyor. Bu hafif sarmalayıcı TS'e doğru
 * prop sözleşmesini açıkça söylüyor.
 */
type MLOEProps = {
  value: Record<string, any>;
  setValue: (v: Record<string, any>) => void;
  supportedLocales?: readonly string[];
};
const MLOE: React.FC<MLOEProps> = (p) => (
  <MultiLangObjectEditor {...(p as any)} />
);

const ValueInputSection: React.FC<ValueInputSectionProps> = ({
  keyValue,
  value,
  setValue,
  availableThemes,
  isMultiLang,
  isNestedObject,
  isImage,
  supportedLocales = SUPPORTED_LOCALES,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const isImageKey = IMAGE_KEYS.includes(keyValue);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiLang, isNestedObject, isImage, isImageKey, keyValue]);

  // 1) MultiLang (TranslatedLabel)
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

  // 2) MultiLang + Nested Object — özel anahtarlar
  if (
    MULTILANG_OBJECT_KEYS.includes(keyValue) &&
    isMultiLang &&
    isNestedObject &&
    !isImage
  ) {
    const safeVal = typeof value === "object" && value !== null ? value : {};
    return (
      <MLOE
        value={safeVal}
        setValue={setValue as (v: Record<string, any>) => void}
        supportedLocales={supportedLocales}
      />
    );
  }

  // 3) Image anahtarları — bilgi (ImageUploader üst formda)
  if (isImageKey) {
    return (
      <Info>
        {t(
          "imagesManagedAbove",
          "Images for this key are managed by the uploader above."
        )}
      </Info>
    );
  }

  // 4) Available Themes listesi
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

  // 5) Seçili tema (site_template)
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

  // 6) Generic nested object → JSONEditor
  if (isNestedObject && !isMultiLang && !isImage) {
    const safeObj = typeof value === "object" && value !== null ? value : {};
    return (
      <EditorBlock>
        <JSONEditor
          label={t("jsonEditor", "JSON Editor")}
          value={safeObj}
          onChange={(v: any) => setValue(v || {})}
          placeholder={JSON.stringify(
            { fieldKey: { label: { tr: "", en: "" }, url: "" } },
            null,
            2
          )}
        />
      </EditorBlock>
    );
  }

  // 7) Düz string
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

/* styled */
const Label = styled.label`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  margin-bottom:${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.text};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Input = styled.input`
  padding:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.sm};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
  width:100%;
  &:focus{outline:none;border-color:${({theme})=>theme.colors.primary};
    box-shadow:0 0 0 2px ${({theme})=>theme.colors.primaryTransparent};}
`;
const Select = styled.select`
  padding:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.sm};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
  width:100%;
`;
const Info = styled.div`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  padding:${({theme})=>theme.spacings.sm};
  border-radius:${({theme})=>theme.radii.sm};
`;
const EditorBlock = styled.div`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.cardBackground};
`;
