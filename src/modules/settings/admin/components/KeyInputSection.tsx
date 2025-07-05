"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

const SYSTEM_KEYS = [
  "available_themes",
  "site_template",
  "navbar_logos",
  "footer_logos",
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
  const { i18n, t } = useI18nNamespace("settings", translations);

  const isSystemKey = SYSTEM_KEYS.includes(keyValue);

  const handleNestedChange = () => {
    const newVal = !isNestedObject;
    setIsNestedObject(newVal);
    if (newVal) setIsMultiLang(false);
  };

  const handleMultiLangChange = () => {
    const newVal = !isMultiLang;
    setIsMultiLang(newVal);
    if (newVal) setIsNestedObject(false);
  };

  const canImage = !isMultiLang && !isNestedObject && !isSystemKey;

  return (
    <>
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
      {!isSystemKey && (
        <>
          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isMultiLang}
              onChange={handleMultiLangChange}
              id="multiLang"
              disabled={isNestedObject}
            />
            <label htmlFor="multiLang">
              {t("multiLanguage", "Multi-Language?")}
            </label>
          </CheckboxWrapper>
          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isNestedObject}
              onChange={handleNestedChange}
              id="nestedObject"
              disabled={isMultiLang}
            />
            <label htmlFor="nestedObject">
              {t("nestedObject", "Is Nested Object?")}
            </label>
          </CheckboxWrapper>
          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isImage}
              onChange={() => setIsImage(!isImage)}
              id="isImage"
              disabled={!canImage}
            />
            <label htmlFor="isImage">
              {t("isImage", "Is this a file/image?")}
            </label>
          </CheckboxWrapper>
        </>
      )}
    </>
  );
};

export default KeyInputSection;

// Styled Components
const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin: ${({ theme }) => theme.spacings.sm} 0;
`;
