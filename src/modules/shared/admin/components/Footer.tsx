"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import type {
  CompanyLogo,
  CompanyFormValues,
} from "@/modules/company/types/company";

interface FooterSectionProps {
  company: (CompanyFormValues & { logos?: CompanyLogo[] }) | null;
}

const DEFAULT_LOGO = "/default-company-logo.png"; // public/ altında olmalı

function resolveLogoUrl(logo?: CompanyLogo): string {
  if (!logo) return DEFAULT_LOGO;
  const url = logo.thumbnail || logo.url || "";
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
  const { t } = useTranslation("common");

  if (!company) return null;

  // type-safe logos
  const logos: CompanyLogo[] = Array.isArray(company.logos)
    ? company.logos
    : [];

  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          {logos.length > 0 ? (
            logos.map((logo, idx) => (
              <Logo
                key={(logo.url || "") + idx}
                src={resolveLogoUrl(logo)}
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
          <CompanyText>
            {company.address?.street}, {company.address?.city}
          </CompanyText>
        </InfoSection>
      </FooterContent>
      <CopyRight>
        &copy; {new Date().getFullYear()} {company.companyName}.{" "}
        {t("footer.rights", "All rights reserved")}.
      </CopyRight>
    </FooterContainer>
  );
}

// Styled Components
const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CompanyText = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const CopyRight = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: ${({ theme }) => theme.opacity.disabled};
`;
