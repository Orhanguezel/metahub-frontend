"use client";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";
import { SupportedLocale } from "@/types/common";

// Firma adı çoklu dil object olabilir, handle et
function resolveCompanyName(companyName: any, lang: SupportedLocale): string {
  if (!companyName) return "";
  if (typeof companyName === "string") return companyName;
  if (typeof companyName === "object") {
    return (
      companyName[lang] ||
      companyName.tr ||
      Object.values(companyName)[0] || ""
    );
  }
  return "";
}

export default function FooterCopyright() {
  const settings = useAppSelector((state) => state.settings.settings) ?? [];
  const company = useAppSelector((state) => state.company.company);
  const { i18n } = useI18nNamespace("footer", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Settings’ten dinamik değerler
  const getLocalizedValue = (value: any): string | undefined => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[lang] || value.tr || Object.values(value)[0] || "";
    }
    return value;
  };

  const dynamicCompanyRaw = settings.find((s: any) => s.key === "footer_company_name")?.value;
  const dynamicRightsRaw = settings.find((s: any) => s.key === "footer_rights")?.value;

  // Firma adı settings > company > fallback ""
  const companyName =
    getLocalizedValue(dynamicCompanyRaw) ||
    resolveCompanyName(company?.companyName, lang) ||
    "";

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
        Designed by GuezelWebDesign
      </DesignLink>
    </Copyright>
  );
}

// --- Styled Components (DEĞİŞTİRME) ---
const Copyright = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  padding: ${({ theme }) => theme.spacings.sm} 0 ${({ theme }) => theme.spacings.xs};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  letter-spacing: 0.01em;
  margin-top: ${({ theme }) => theme.spacings.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.6;

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    padding: ${({ theme }) => theme.spacings.xs} 0;
    margin-top: ${({ theme }) => theme.spacings.xs};
  }
`;

const DesignLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  margin-top: 2px;
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-style: italic;
  opacity: 0.75;
  transition: color ${({ theme }) => theme.transition.fast}, opacity 0.25s;

  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    margin-bottom: 44px;
  }

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.accent};
    opacity: 1;
    text-decoration: underline;
    outline: none;
  }
`;
