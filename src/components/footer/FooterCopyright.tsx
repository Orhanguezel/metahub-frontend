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

  const dynamicCompanyRaw = settings.find((s) => s.key === "footer_company_name")
    ?.value;
  const dynamicRightsRaw = settings.find((s) => s.key === "footer_rights_text")
    ?.value;

  const finalCompanyName =
    getLocalizedValue(dynamicCompanyRaw) || companyName;
  const finalRightsText =
    getLocalizedValue(dynamicRightsRaw) || rightsText || "";

  return (
    <Copyright>
      © {new Date().getFullYear()} {finalCompanyName}
      {finalRightsText && `. ${finalRightsText}`}
      <br />
      <a
        href="https://www.guezelwebdesign.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Designed by OG
      </a>
    </Copyright>
  );
}

const Copyright = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  ${({ theme }) => theme.media.small} {
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;
