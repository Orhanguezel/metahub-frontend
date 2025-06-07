"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";

interface FooterCopyrightProps {
  rightsText?: string;
  companyName?: string;
}

export default function FooterCopyright({
  rightsText,
  companyName = "Ensotek Kühlturm GmbH",
}: FooterCopyrightProps) {
  const settings = useAppSelector((state) => state.setting.settings) ?? [];
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "tr";

  const getLocalizedValue = (value: any): string | undefined => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[currentLang] || value.tr || "";
    }
    return value;
  };

  const dynamicCompanyRaw = settings.find(
    (s) => s.key === "footer_company_name"
  )?.value;
  const dynamicRightsRaw = settings.find(
    (s) => s.key === "footer_rights_text"
  )?.value;

  const finalCompanyName = getLocalizedValue(dynamicCompanyRaw) || companyName;
  const finalRightsText =
    getLocalizedValue(dynamicRightsRaw) || rightsText || "";

  return (
    <Copyright>
      <span>
        &copy; {new Date().getFullYear()} <strong>{finalCompanyName}</strong>
        {finalRightsText && <>. {finalRightsText}</>}
      </span>
      <br />
      <DesignLink
        href="https://www.guezelwebdesign.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Designed by OG
      </DesignLink>
    </Copyright>
  );
}

const Copyright = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  text-align: center;
  opacity: 0.88;
  letter-spacing: 0.02em;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    letter-spacing: 0.04em;
  }
`;

const DesignLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  margin-top: 4px;
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  opacity: 0.8;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 1;
    text-decoration: underline;
    outline: none;
  }
`;
