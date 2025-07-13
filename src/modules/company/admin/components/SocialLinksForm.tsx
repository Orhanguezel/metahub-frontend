"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

interface Props {
  initialValues: SocialLinks;
  onSubmit: (values: SocialLinks) => void;
  loading?: boolean;
}

const SOCIAL_KEYS: (keyof SocialLinks)[] = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
];

const SocialLinksForm: React.FC<Props> = ({
  initialValues,
  onSubmit,
  loading,
}) => {
  const { t } = useI18nNamespace("company", translations);
  const [formData, setFormData] = useState<SocialLinks>({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  });

  useEffect(() => {
    setFormData({
      facebook: initialValues.facebook || "",
      instagram: initialValues.instagram || "",
      twitter: initialValues.twitter || "",
      linkedin: initialValues.linkedin || "",
      youtube: initialValues.youtube || "",
    });
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Label ve placeholder'lar i18n ile alınır
  const getLabel = (key: keyof SocialLinks) =>
    t(`socialLabels.${key}`, key.charAt(0).toUpperCase() + key.slice(1));

  const getPlaceholder = (key: keyof SocialLinks) =>
    t(`socialPlaceholders.${key}`, `https://${key}.com/yourcompany`);

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <SectionTitle>{t("socialMedia", "Sosyal Medya Hesapları")}</SectionTitle>
      <InputsGrid>
        {SOCIAL_KEYS.map((key) => (
          <InputBlock key={key}>
            <Label htmlFor={key}>{getLabel(key)}</Label>
            <Input
              id={key}
              name={key}
              type="url"
              value={formData[key] || ""}
              onChange={handleChange}
              placeholder={getPlaceholder(key)}
              autoComplete="off"
              disabled={!!loading}
            />
          </InputBlock>
        ))}
      </InputsGrid>
      <Button type="submit" disabled={!!loading}>
        {loading ? t("saving", "Kaydediliyor...") : t("save", "Kaydet")}
      </Button>
    </Form>
  );
};

export default SocialLinksForm;

// Styled Components
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

const InputBlock = styled.div`
  width: 100%;
`;

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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
