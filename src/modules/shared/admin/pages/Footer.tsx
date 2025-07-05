"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/footer";
import type { ICompany, ICompanyImage } from "@/modules/company/types";

// Props tipi: Doğrudan ICompany
interface FooterSectionProps {
  company: ICompany | null;
}

const DEFAULT_LOGO = "/default-company-logo.png"; // public/ altında olmalı

function resolveLogoUrl(logos?: ICompanyImage[]): string {
  if (!logos || logos.length === 0) return DEFAULT_LOGO;
  const url = logos[0]?.thumbnail || logos[0]?.url || "";
  if (!url) return DEFAULT_LOGO;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  // local path için:
  return url;
}

export default function FooterSection({ company }: FooterSectionProps) {
  const { i18n, t } = useI18nNamespace("footer", translations);

  if (!company) return null;

  // Type-safe logos
  const logos: ICompanyImage[] = Array.isArray(company.logos)
    ? company.logos
    : [];

  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          {logos.length > 0 ? (
            logos.map((logo, idx) => (
              <Logo
                key={(logo.url || logo.thumbnail || "logo") + idx}
                src={resolveLogoUrl([logo])}
                alt={`Company Logo ${idx + 1}`}
              />
            ))
          ) : (
            <Logo src={DEFAULT_LOGO} alt="Default Logo" />
          )}
        </LogoSection>
        <InfoSection>
          <CompanyName>{company.companyName}</CompanyName>
          <CompanyText>{company.email}</CompanyText>
          <CompanyText>{company.phone}</CompanyText>
          {company.address && (
            <CompanyText>
              {company.address.street}, {company.address.city},{" "}
              {company.address.postalCode}, {company.address.country}
            </CompanyText>
          )}
          {company.socialLinks && (
            <SocialLinks>
              {company.socialLinks.facebook && (
                <a
                  href={company.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}
              {company.socialLinks.instagram && (
                <a
                  href={company.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
              {company.socialLinks.twitter && (
                <a
                  href={company.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              )}
              {company.socialLinks.linkedin && (
                <a
                  href={company.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {company.socialLinks.youtube && (
                <a
                  href={company.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              )}
            </SocialLinks>
          )}
        </InfoSection>
      </FooterContent>
      <CopyRight>
        &copy; {new Date().getFullYear()} {company.companyName}.{" "}
        {t("footer.rights", "All rights reserved")}.
      </CopyRight>
    </FooterContainer>
  );
}

// --- Styled Components (değişmeden bırakabilirsin) ---
const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.lg}
    ${({ theme }) => theme.spacings.md};
  text-align: center;
  transition: background-color ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;

  ${({ theme }) => theme.media.small} {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const LogoSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.small} {
    margin-bottom: 0;
  }
`;

const Logo = styled.img`
  width: 140px;
  height: 140px;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: transform ${({ theme }) => theme.transition.normal};
  object-fit: contain;
  background: ${({ theme }) =>
    theme.colors.backgroundAlt}; // tema ile uyumlu arka plan
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const InfoSection = styled.div`
  text-align: center;

  ${({ theme }) => theme.media.small} {
    text-align: left;
  }
`;

const CompanyName = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CompanyText = styled.p`
  margin: ${({ theme }) => theme.spacings.xs} 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const CopyRight = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: ${({ theme }) => theme.opacity.disabled};
`;

const SocialLinks = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  display: flex;
  gap: 12px;
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-size: 1em;
    transition: color 0.14s;
    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover || "#0086E0"};
      text-decoration: underline;
    }
  }
`;
