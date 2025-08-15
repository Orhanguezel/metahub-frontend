// src/modules/pricelist/ui/components/MultiLangInput.tsx
"use client";
import styled, { css } from "styled-components";
import { useMemo } from "react";
import type { TranslatedLabel } from "@/modules/pricelist/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  LANG_LABELS,
} from "@/types/common";

type Props = {
  label: string;
  value?: TranslatedLabel;
  onChange: (v: TranslatedLabel) => void;
  placeholder?: string;
  locales?: SupportedLocale[];
  multiline?: boolean;   // description gibi alanlar için
  rows?: number;         // multiline olduğunda satır sayısı
  disabled?: boolean;
  required?: boolean;
};

export default function MultiLangInput({
  label,
  value,
  onChange,
  placeholder,
  locales = SUPPORTED_LOCALES,
  multiline = false,
  rows = 3,
  disabled = false,
  required = false,
}: Props) {
  const { i18n } = useI18nNamespace("pricelist", translations);

  // Value her zaman partial map
  const v = useMemo<TranslatedLabel>(() => value ?? {}, [value]);

  // Dil adları (Intl varsa onu, yoksa LANG_LABELS fallback)
  const dn = useMemo(() => {
    try {
      return new Intl.DisplayNames(i18n.language, { type: "language" });
    } catch {
      return null as Intl.DisplayNames | null;
    }
  }, [i18n.language]);

  return (
    <Wrap>
      <Legend>{label}</Legend>

      <Grid>
        {locales.map((l) => {
          const langName = (dn?.of(l) || LANG_LABELS[l] || l).toString();
          const id = `ml-${label.replace(/\s+/g, "-").toLowerCase()}-${l}`;
          const commonProps = {
            id,
            placeholder,
            "aria-label": `${label} (${langName})`,
            value: v?.[l] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...(v || {}), [l]: e.target.value }),
            disabled,
            required,
          };

          return (
            <Col key={l}>
              <Small as="label" htmlFor={id} title={l}>
                {langName}
              </Small>

              {multiline ? (
                <TextArea rows={rows} {...commonProps} />
              ) : (
                <Input inputMode="text" autoComplete="off" {...commonProps} />
              )}
            </Col>
          );
        })}
      </Grid>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;
const Legend = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(2, 1fr);
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const Small = styled.span`
  opacity: 0.75;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  resize: vertical;
  ${focusable}
`;
