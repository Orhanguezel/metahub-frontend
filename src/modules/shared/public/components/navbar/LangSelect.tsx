"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import {
  SUPPORTED_LOCALES,
  LANG_LABELS,
  SupportedLocale,
} from "@/types/common";

// Eğer mevcut değilse, 'en' fallback!
function getValidLang(lang: string): SupportedLocale {
  return SUPPORTED_LOCALES.includes(lang as SupportedLocale)
    ? (lang as SupportedLocale)
    : "en";
}

interface Props {
  value?: string; // Current language code
  onChange?: (lang: SupportedLocale) => void;
  ariaLabel?: string;
  hideLabel?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const LangSelect: React.FC<Props> = ({
  onChange,
  hideLabel = false,
  style,
  className,
}) => {
   const { i18n } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = getValidLang(e.target.value);
    i18n.changeLanguage(selected);
    if (onChange) onChange(selected);
  };

  return (
    <LangSelectWrapper style={style} className={className}>
      {!hideLabel}
      <Select value={lang} onChange={handleChange}>
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LANG_LABELS[code]}
          </option>
        ))}
      </Select>
    </LangSelectWrapper>
  );
};

export default LangSelect;

// Styled
const LangSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Select = styled.select`
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.inputs.text};
  cursor: pointer;
  option {
    color: ${({ theme }) => theme.inputs.text};
    background: ${({ theme }) => theme.inputs.background};
  }
`;
