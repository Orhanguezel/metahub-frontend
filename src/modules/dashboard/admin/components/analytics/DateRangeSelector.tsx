// src/shared/DateRangeSelector.tsx
"use client";
import React, { useId } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";
import { SUPPORTED_LOCALES, SupportedLocale, DATE_FORMATS } from "@/types/common";

interface DateRangeSelectorProps {
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
}: DateRangeSelectorProps) {
  const { i18n, t } = useI18nNamespace("dashboard", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const pickerId = useId();

  // date-fns ya da başka bir datepicker locale eklemeye gerek yok, düz input[type=date]
  const resolvedFormat = dateFormat || DATE_FORMATS[lang] || "yyyy-MM-dd";

  const safeStart = startDate instanceof Date ? startDate : null;
  const safeEnd = endDate instanceof Date ? endDate : null;

  // Değişiklikleri parent'a aktar
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : null;
    onChange({ startDate: val, endDate: safeEnd });
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value) : null;
    onChange({ startDate: safeStart, endDate: val });
  };

  return (
    <Wrapper>
      <Label htmlFor={`${pickerId}-start`}>
        {t("analytics.dateRange", "Tarih Aralığı")}
      </Label>
      <Row>
        <input
          id={`${pickerId}-start`}
          type="date"
          value={safeStart ? safeStart.toISOString().split("T")[0] : ""}
          onChange={handleStartChange}
          min={minDate ? minDate.toISOString().split("T")[0] : undefined}
          max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
          placeholder={t("analytics.startDate", "Başlangıç")}
          pattern={resolvedFormat.replace(/[dMy]/g, "\\d")}
        />
        <span>—</span>
        <input
          id={`${pickerId}-end`}
          type="date"
          value={safeEnd ? safeEnd.toISOString().split("T")[0] : ""}
          onChange={handleEndChange}
          min={minDate ? minDate.toISOString().split("T")[0] : undefined}
          max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
          placeholder={t("analytics.endDate", "Bitiş")}
          pattern={resolvedFormat.replace(/[dMy]/g, "\\d")}
        />
      </Row>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-bottom: 2rem;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
