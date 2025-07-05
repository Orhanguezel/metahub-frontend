"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import type { ICompany, ICompanyImage } from "@/modules/company/types";

interface CompanyInfoCardProps {
  company: ICompany | null;
}

const DEFAULT_LOGO = "/default-company-logo.png";

function resolveLogoUrl(logo?: ICompanyImage): string {
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
  return url;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const { t } = useTranslation("company");

  if (!company) return null;

  const logos =
    Array.isArray(company.logos) && company.logos.length > 0
      ? company.logos
      : [];

  return (
    <Card>
      <InfoBlock>
        <CompanyName>{company.companyName}</CompanyName>
        <Contact>{company.email}</Contact>
        <Contact>{company.phone}</Contact>
        <Contact>
          {company.address?.street}, {company.address?.city}
        </Contact>
      </InfoBlock>
      <LogoRow>
        {logos.length > 0 ? (
          logos.map((logo, idx) => (
            <Logo
              key={(logo.url || "") + idx}
              src={resolveLogoUrl(logo)}
              alt={t("companyLogoAlt", "Company Logo {{n}}", { n: idx + 1 })}
            />
          ))
        ) : (
          <Logo src={DEFAULT_LOGO} alt={t("defaultLogoAlt", "Default Logo")} />
        )}
      </LogoRow>
    </Card>
  );
}

const Card = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 440px;
  margin: 0 auto;

  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const InfoBlock = styled.div`
  flex: 1;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    text-align: left;
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.spacings.xl};
  }
`;

const CompanyName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Contact = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacings.xs} 0;
`;

const LogoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: contain;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }
`;
