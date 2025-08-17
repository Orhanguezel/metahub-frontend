"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

const SYSTEM_KEYS = [
  "available_themes",
  "site_template",
  "navbar_images",
  "footer_images",
  "logo_images",
  "images",
];

interface KeyInputSectionProps {
  keyValue: string;
  setKey: (value: string) => void;
  isMultiLang: boolean;
  setIsMultiLang: (value: boolean) => void;
  isImage: boolean;
  setIsImage: (value: boolean) => void;
  isNestedObject: boolean;
  setIsNestedObject: (value: boolean) => void;
  isEditing: boolean;
  supportedLocales: readonly string[];
}

const KeyInputSection: React.FC<KeyInputSectionProps> = ({
  keyValue,
  setKey,
  isMultiLang,
  setIsMultiLang,
  isImage,
  setIsImage,
  isNestedObject,
  setIsNestedObject,
  isEditing,
}) => {
  const { t } = useI18nNamespace("settings", translations);

  const isSystemKey = SYSTEM_KEYS.includes(keyValue);
  const isImageKey =
    ["navbar_images", "footer_images", "logo_images", "images"].includes(
      keyValue
    );

  // toggle izinleri
  const canMultiLang = !isImageKey && !isSystemKey;
  const canNested = !isImageKey && !isSystemKey;
  const canImage =
    !isMultiLang && !isNestedObject && !isSystemKey && !isImageKey;

  const handleNestedChange = () => {
    const v = !isNestedObject;
    setIsNestedObject(v);
    if (v) {
      setIsMultiLang(false);
      setIsImage(false);
    }
  };
  const handleMultiLangChange = () => {
    const v = !isMultiLang;
    setIsMultiLang(v);
    if (v) {
      setIsNestedObject(false);
      setIsImage(false);
    }
  };
  const handleImageChange = () => {
    const v = !isImage;
    setIsImage(v);
    if (v) {
      setIsMultiLang(false);
      setIsNestedObject(false);
    }
  };

  return (
    <Block>
      <Label>{t("key", "Key")}</Label>
      <Input
        type="text"
        value={keyValue}
        onChange={(e) => setKey(e.target.value)}
        placeholder={t("keyPlaceholder", "Enter key")}
        required
        disabled={isEditing || isSystemKey}
        autoComplete="off"
      />

      {!isSystemKey && !isImageKey && (
        <Toggles>
          <Toggle>
            <input
              id="multiLang"
              type="checkbox"
              checked={isMultiLang}
              onChange={handleMultiLangChange}
              disabled={!canMultiLang || isEditing}
            />
            <span>{t("multiLanguage", "Multi-Language?")}</span>
          </Toggle>

          <Toggle>
            <input
              id="nestedObject"
              type="checkbox"
              checked={isNestedObject}
              onChange={handleNestedChange}
              disabled={!canNested || isEditing}
            />
            <span>{t("nestedObject", "Is Nested Object?")}</span>
          </Toggle>

          <Toggle>
            <input
              id="isImage"
              type="checkbox"
              checked={isImage}
              onChange={handleImageChange}
              disabled={!canImage || isEditing}
            />
            <span>{t("isImage", "Is this a file/image?")}</span>
          </Toggle>
        </Toggles>
      )}

      {isImageKey && (
        <Info>
          {t(
            "systemImageKeyInfo",
            "This key accepts multiple image uploads. Images are managed above."
          )}
        </Info>
      )}
    </Block>
  );
};

export default KeyInputSection;

/* styled */
const Block = styled.section`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};
`;
const Label = styled.label`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
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
`;
const Toggles = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};flex-wrap:wrap;`;
const Toggle = styled.label`
  display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;
  font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};
`;
const Info = styled.div`
  margin-top:${({theme})=>theme.spacings.xs};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.info};
`;
