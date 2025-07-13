"use client";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";
import { SupportedLocale } from "@/types/common";

export default function FooterCopyright() {
  const settings = useAppSelector((state) => state.settings.settings) ?? [];
  const company = useAppSelector((state) => state.company.company);
   const { i18n} = useI18nNamespace("footer", translations);
    const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Settings’ten dinamik değerler
  const getLocalizedValue = (value: any): string | undefined => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[lang] || value.tr || "";
    }
    return value;
  };

  const dynamicCompanyRaw = settings.find((s: any) => s.key === "footer_company_name")?.value;
  const dynamicRightsRaw = settings.find((s: any) => s.key === "footer_rights_text")?.value;

  const companyName =
    getLocalizedValue(dynamicCompanyRaw) || company?.companyName || "";
  const rightsText = getLocalizedValue(dynamicRightsRaw) || "";

  // Eğer company veya rights yoksa, component hiç render edilmez!
  if (!companyName && !rightsText) return null;

  return (
    <Copyright>
      <span>
        &copy; {new Date().getFullYear()} <strong>{companyName}</strong>
        {rightsText && <>. {rightsText}</>}
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
  margin-top: ${({ theme }) => theme.spacings.lg};
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
