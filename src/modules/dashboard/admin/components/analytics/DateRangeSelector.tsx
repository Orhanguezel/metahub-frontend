"use client";

import React, { useId } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LOCALES,
  DATE_FORMATS,
  type SupportedLocale,
} from "@/types/common";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onChange,
  dateFormat,
  minDate,
  maxDate,
}: Props) {
  const { t, i18n } = useTranslation("admin-dashboard");
  const pickerId = useId();

  // Her zaman SUPPORTED_LOCALES ile kontrol
  const locale: SupportedLocale = SUPPORTED_LOCALES.includes(
    i18n.language as SupportedLocale
  )
    ? (i18n.language as SupportedLocale)
    : "en";

  // Merkezden format
  const resolvedFormat = dateFormat || DATE_FORMATS[locale];

  // Değer güvenliği
  const safeStart = startDate instanceof Date ? startDate : null;
  const safeEnd = endDate instanceof Date ? endDate : null;

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onChange({ startDate: start, endDate: end });
  };

  return (
    <Wrapper>
      <Label htmlFor={pickerId}>
        {t("analytics.dateRange", "Tarih Aralığı")}
      </Label>
      <StyledPicker>
        <DatePicker
          id={pickerId}
          aria-label={t("analytics.dateRangeAria", "Tarih aralığı seçici")}
          selected={safeStart}
          onChange={handleChange}
          startDate={safeStart}
          endDate={safeEnd}
          selectsRange
          isClearable
          dateFormat={resolvedFormat}
          placeholderText={t("analytics.datePlaceholder", "Tarih aralığı seçiniz")}
          className="date-input"
          locale={locale}
          minDate={minDate}
          maxDate={maxDate}
        />
      </StyledPicker>
    </Wrapper>
  );
}

// --- Styled Components ---
const Wrapper = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StyledPicker = styled.div`
  .date-input {
    width: 100%;
    max-width: 300px;
    padding: 0.65rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.md};
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.borderInput};
    border-radius: ${({ theme }) => theme.radii.md};
    outline: none;
    transition: border-color 0.2s ease;

    &::placeholder {
      color: ${({ theme }) => theme.colors.placeholder};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.shadowHighlight};
    }
  }

  .react-datepicker {
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 0.9rem;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.textOnSuccess};
  }

  .react-datepicker__day:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
