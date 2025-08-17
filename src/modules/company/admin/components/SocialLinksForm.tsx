// src/modules/company/components/SocialLinksForm.tsx
"use client";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import styled from "styled-components";
import type { ISocialLink } from "@/modules/company/types";

interface Props {
  values: ISocialLink;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  renderAsForm?: boolean;
}

const SOCIAL_KEYS: (keyof ISocialLink)[] = ["facebook", "instagram", "twitter", "linkedin", "youtube"];

const SocialLinksForm: React.FC<Props> = ({ values, onChange, loading, onSubmit, renderAsForm = true }) => {
  const { t } = useI18nNamespace("company", translations);

  const getLabel = (k: keyof ISocialLink) => t(`socialLabels.${k}`, k.charAt(0).toUpperCase() + k.slice(1));
  const getPlaceholder = (k: keyof ISocialLink) => t(`socialPlaceholders.${k}`, `https://${k}.com/yourcompany`);

  const content = (
    <>
      <SectionTitle>{t("socialMedia", "Sosyal Medya Hesapları")}</SectionTitle>
      <InputsGrid>
        {SOCIAL_KEYS.map((k) => (
          <InputBlock key={k}>
            <Label htmlFor={k}>{getLabel(k)}</Label>
            <Input
              id={k}
              name={k}
              type="url"
              value={values?.[k] || ""}
              onChange={onChange}
              placeholder={getPlaceholder(k)}
              autoComplete="off"
              disabled={!!loading}
            />
          </InputBlock>
        ))}
      </InputsGrid>
      {renderAsForm && (
        <Primary type="submit" disabled={!!loading}>
          {loading ? t("saving", "Kaydediliyor...") : t("save", "Kaydet")}
        </Primary>
      )}
    </>
  );

  return renderAsForm ? (
    <Form onSubmit={onSubmit} autoComplete="off" noValidate>{content}</Form>
  ) : (
    content
  );
};

export default SocialLinksForm;

/* styled (pattern) */
const Form = styled.form`
  margin-top:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const SectionTitle = styled.h4`
  margin-bottom:${({theme})=>theme.spacings.md};
  color:${({theme})=>theme.colors.textPrimary};
  font-size:${({theme})=>theme.fontSizes.md};
  font-weight:${({theme})=>theme.fontWeights.bold};
`;
const InputsGrid = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.md}; grid-template-columns:1fr;
  ${({theme})=>theme.media.small}{ grid-template-columns:1fr 1fr; }
`;
const InputBlock = styled.div`width:100%;`;
const Label = styled.label`
  display:block; font-weight:${({theme})=>theme.fontWeights.semiBold};
  margin-bottom:${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textSecondary};
`;
const Input = styled.input`
  padding:10px 12px; width:100%;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
  margin-bottom:${({theme})=>theme.spacings.sm};
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ background:${({theme})=>theme.colors.disabled}; color:${({theme})=>theme.colors.textSecondary}; cursor:not-allowed; opacity:0.8; }
`;
const Primary = styled.button`
  margin-top:${({theme})=>theme.spacings.md};
  padding:8px 14px; min-width:140px;
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:hover:not(:disabled){ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;
