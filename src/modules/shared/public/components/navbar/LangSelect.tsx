"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES } from "@/i18n"; // Public için de aynısı!
import translations from "@/modules/shared/locales/header";

// Adminde getLocaleLabel fonksiyonun:
function getLocaleLabel(locale: string): string {
  return SUPPORTED_LOCALES.includes(locale as any)
    ? locale.toUpperCase()
    : locale;
}

interface Props {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LangSelect(props: Props) {
  const { value, onChange, ariaLabel, className, style } = props;
  const { i18n } = useI18nNamespace("header", translations);

  return (
    <LangSelectStyled
      value={value ?? i18n.language}
      onChange={onChange ?? ((e) => i18n.changeLanguage(e.target.value))}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <option key={locale} value={locale}>
          {getLocaleLabel(locale)}
        </option>
      ))}
    </LangSelectStyled>
  );
};

const LangSelectStyled = styled.select`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.grey};
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  min-width: 64px;
  max-width: 110px;
  transition: border 0.15s, color 0.13s;

  &:hover,
  &:focus-visible {
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  option {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }

  /* Tablet */
  ${({ theme }) => theme.media.medium} {
    font-size: 0.95em;
    min-width: 54px;
    max-width: 90px;
    padding: 3px 8px;
    border-radius: 5px;
  }

  /* Mobil */
  ${({ theme }) => theme.media.small} {
    font-size: 0.77em;
    min-width: 44px;
    max-width: 74px;
    padding: 2px;
    border-radius: 4px;
  }
`;

