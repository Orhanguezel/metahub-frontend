"use client";

import styled from "styled-components";
import { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { ICompany } from "@/modules/company/types";
import { SupportedLocale } from "@/types/common";

// Varsayılan logo yolu
const DEFAULT_LOGO = "/default-company-logo.png";

// Populated address type
type PopulatedAddress = {
  _id?: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;
  isDefault?: boolean;
};

export default function CompanyInfoCard({ company }: { company: ICompany | null }) {
  const { i18n, t } = useI18nNamespace("company", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  // --- Çoklu dil isim ve açıklama ---
  const companyName =
    (typeof company?.companyName === "object" && company?.companyName[lang]) ||
    (typeof company?.companyName === "string" && company?.companyName) ||
    t("companyName", "Company Name");

  const companyDesc =
    (typeof company?.companyDesc === "object" && company?.companyDesc[lang]) ||
    (typeof company?.companyDesc === "string" && company?.companyDesc) ||
    "";

  // --- İlk adresi bul (populated veya id olabilir) ---
  // Not: Eğer sadece id string array ise addressStr = "-"
  const addressStr = useMemo(() => {
    if (!company?.addresses || company.addresses.length === 0) return "-";
    // Populated mi kontrolü (object içeriyorsa street olmalı)
    const addr = company.addresses.find(
      (a: any) => typeof a === "object" && !!a && "street" in a
    ) as PopulatedAddress | undefined;

    if (addr) {
      return [addr.street, addr.city, addr.zipCode, addr.country]
        .filter(Boolean)
        .join(", ");
    }
    return "-";
  }, [company?.addresses]);

  // --- Görseller
  const images =
    Array.isArray(company?.images) && company.images.length > 0
      ? company.images
      : [];

  // --- Hiç şirket yoksa veya companyName bile yoksa render etme
  if (!company || !companyName) return null;

  return (
    <Card>
      <InfoBlock>
        <CompanyName>{companyName}</CompanyName>
        {companyDesc && <CompanyDesc>{companyDesc}</CompanyDesc>}
        <Contact>{company.email || "-"}</Contact>
        <Contact>{company.phone || "-"}</Contact>
        <Contact>{addressStr}</Contact>
        {company.website && (
          <Contact>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {company.website}
            </a>
          </Contact>
        )}
      </InfoBlock>
      <LogoRow>
        {images.length > 0 ? (
          images.map((image, idx) => (
            <Logo
              key={(image.url || "") + idx}
              src={image.thumbnail || image.url}
              alt={t("companyLogoAlt", "Company Logo {{n}}", { n: idx + 1 })}
              loading="lazy"
            />
          ))
        ) : (
          <Logo
            src={DEFAULT_LOGO}
            alt={t("defaultLogoAlt", "Default Logo")}
            loading="lazy"
          />
        )}
      </LogoRow>
    </Card>
  );
}

// --- Styled Components ---
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

const CompanyDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Contact = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacings.xs} 0;
  word-break: break-all;
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
