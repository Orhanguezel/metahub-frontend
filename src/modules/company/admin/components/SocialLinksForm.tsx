"use client";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import styled from "styled-components";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

interface Props {
  values: SocialLinks;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  // Eğer kendi başına form olarak kullanılacaksa:
  onSubmit?: (e: React.FormEvent) => void;
  renderAsForm?: boolean; // Varsayılan true, parent formda ise false gönder!
}

const SOCIAL_KEYS: (keyof SocialLinks)[] = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
];

const SocialLinksForm: React.FC<Props> = ({
  values,
  onChange,
  loading,
  onSubmit,
  renderAsForm = true,
}) => {
  const { t } = useI18nNamespace("company", translations);

  // Label ve placeholder'lar i18n ile alınır
  const getLabel = (key: keyof SocialLinks) =>
    t(`socialLabels.${key}`, key.charAt(0).toUpperCase() + key.slice(1));
  const getPlaceholder = (key: keyof SocialLinks) =>
    t(`socialPlaceholders.${key}`, `https://${key}.com/yourcompany`);

  // İçeriği tek bir değişkene koy, tekrar kullan:
  const content = (
    <>
      <SectionTitle>{t("socialMedia", "Sosyal Medya Hesapları")}</SectionTitle>
      <InputsGrid>
        {SOCIAL_KEYS.map((key) => (
          <InputBlock key={key}>
            <Label htmlFor={key}>{getLabel(key)}</Label>
            <Input
  id={key}
  name={key}
  type="url"
  value={values?.[key] || ""}
  onChange={onChange}
  placeholder={getPlaceholder(key)}
  autoComplete="off"
  disabled={!!loading}
/>
          </InputBlock>
        ))}
      </InputsGrid>
      {/* Sadece kendi başına form ise submit butonunu göster */}
      {renderAsForm && (
        <Button type="submit" disabled={!!loading}>
          {loading ? t("saving", "Kaydediliyor...") : t("save", "Kaydet")}
        </Button>
      )}
    </>
  );

  // Eğer parent bir form varsa (örneğin CompanyForm içindeyse) renderAsForm=false gönder!
  if (renderAsForm) {
    return (
      <Form onSubmit={onSubmit} autoComplete="off" noValidate>
        {content}
      </Form>
    );
  } else {
    // Sadece bir grid / input seti döner, parent form submiti yönetir
    return content;
  }
};

export default SocialLinksForm;

// Styled Components...
const Form = styled.form`
  margin-top: 24px;
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;
const SectionTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
const InputsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: 1fr;
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr 1fr;
  }
`;
const InputBlock = styled.div` width: 100%; `;
const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Input = styled.input`
  padding: ${({ theme }) => theme.spacings.sm};
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
    opacity: 0.8;
  }
`;
const Button = styled.button`
  margin-top: ${({ theme }) => theme.spacings.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  min-width: 140px;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;
