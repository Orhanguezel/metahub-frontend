"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  keyValue: string;
  setKey: (v: string) => void;
  isMultiLang: boolean;
  setIsMultiLang: (v: boolean) => void;
  isImage: boolean;
  setIsImage: (v: boolean) => void;
  isNestedObject: boolean;
  setIsNestedObject: (v: boolean) => void;
  isEditing: boolean;
}

export default function KeyInputSection({
  keyValue,
  setKey,
  isMultiLang,
  setIsMultiLang,
  isImage,
  setIsImage,
  isNestedObject,
  setIsNestedObject,
  isEditing,
}: Props) {
  const { t } = useTranslation("adminSettings");

  const handleNestedChange = () => {
    const newVal = !isNestedObject;
    setIsNestedObject(newVal);

    // Eğer nested seçildiyse multi-lang kapatıyoruz (çakışmayı önler)
    if (newVal) {
      setIsMultiLang(false);
    }
  };

  return (
    <>
      <Label>{t("key", "Key")}</Label>
      <Input
        type="text"
        value={keyValue}
        onChange={(e) => setKey(e.target.value)}
        placeholder={t("keyPlaceholder", "Enter key")}
        required
        disabled={isEditing}
      />

      {keyValue !== "available_themes" && keyValue !== "site_template" && (
        <>
          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isMultiLang}
              onChange={() => setIsMultiLang(!isMultiLang)}
              id="multiLang"
              disabled={isNestedObject} // Nested seçildiyse disabled
            />
            <label htmlFor="multiLang">{t("multiLanguage", "Multi-Language?")}</label>
          </CheckboxWrapper>

          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isNestedObject}
              onChange={handleNestedChange}
              id="nestedObject"
            />
            <label htmlFor="nestedObject">{t("nestedObject", "Is Nested Object?")}</label>
          </CheckboxWrapper>

          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={isImage}
              onChange={() => setIsImage(!isImage)}
              id="isImage"
            />
            <label htmlFor="isImage">{t("isImage", "Is this a file/image?")}</label>
          </CheckboxWrapper>
        </>
      )}
    </>
  );
}


const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;
