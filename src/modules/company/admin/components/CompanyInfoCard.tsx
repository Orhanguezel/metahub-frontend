// src/modules/company/components/CompanyInfoCard.tsx
"use client";

import styled from "styled-components";
import { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { ICompany } from "@/modules/company/types";
import type { SupportedLocale } from "@/types/common";

const DEFAULT_LOGO = "/default-company-logo.png";

type PopulatedAddress = {
  _id?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  zipCode?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  country?: string;
  isDefault?: boolean;
};

export default function CompanyInfoCard({ company }: { company: ICompany | null }) {
  const { i18n, t } = useI18nNamespace("company", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  const companyName =
    (company?.companyName as any)?.[lang] ||
    (typeof (company as any)?.companyName === "string" && (company as any)?.companyName) ||
    t("companyName", "Company Name");

  const companyDesc =
    (company?.companyDesc as any)?.[lang] ||
    (typeof (company as any)?.companyDesc === "string" && (company as any)?.companyDesc) ||
    "";

  const addressObj = useMemo(() => {
    if (!company?.addresses?.length) return null;
    return company.addresses.find((a: any) => typeof a === "object" && a && "street" in a) as PopulatedAddress | undefined;
  }, [company?.addresses]);

  const addressStr = useMemo(() => {
    if (!addressObj) return "-";
    const zip = addressObj.zipCode || addressObj.postalCode || "";
    return [addressObj.street, addressObj.houseNumber, addressObj.city, zip, addressObj.country].filter(Boolean).join(", ");
  }, [addressObj]);

  const images = Array.isArray(company?.images) ? company!.images : [];

  if (!company) return null;

  return (
    <Card>
      <Info>
        <Name>{companyName}</Name>
        {companyDesc && <Desc>{companyDesc}</Desc>}
        <Line>{company.email || "-"}</Line>
        <Line>{company.phone || "-"}</Line>
        <Line>{addressStr}</Line>
        {addressObj?.email && <Line>{addressObj.email}</Line>}
        {addressObj?.phone && <Line>{addressObj.phone}</Line>}
        {company.website && (
          <Line>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              {company.website}
            </a>
          </Line>
        )}
      </Info>
      <LogoRow>
        {images.length > 0 ? (
          images.map((img, i) => (
            <Logo key={(img.url || "") + i} src={img.thumbnail || img.url} alt={t("companyLogoAlt", "Company Logo {{n}}", { n: i + 1 })} loading="lazy" />
          ))
        ) : (
          <Logo src={DEFAULT_LOGO} alt={t("defaultLogoAlt", "Default Logo")} loading="lazy" />
        )}
      </LogoRow>
    </Card>
  );
}

const Card = styled.section`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
  display:flex; flex-direction:column; align-items:center;
`;
const Info = styled.div`
  text-align:center; margin-bottom:${({theme})=>theme.spacings.md};
`;
const Name = styled.h3`
  margin:0 0 ${({theme})=>theme.spacings.xs} 0;
  font-size:${({theme})=>theme.fontSizes.lg};
  color:${({theme})=>theme.colors.title};
`;
const Desc = styled.p`
  margin:0 0 ${({theme})=>theme.spacings.xs} 0;
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Line = styled.p`
  margin:${({theme})=>theme.spacings.xs} 0; color:${({theme})=>theme.colors.textSecondary};
  word-break:break-all; font-size:${({theme})=>theme.fontSizes.sm};
  a{ color:inherit; text-decoration:underline; }
`;
const LogoRow = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; flex-wrap:wrap; justify-content:center;
`;
const Logo = styled.img`
  width:120px; height:120px; object-fit:contain; padding:12px;
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.backgroundAlt};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  transition:transform ${({theme})=>theme.transition.normal};
  &:hover{ transform:scale(1.05); }
`;
