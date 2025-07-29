"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";

// Tip tanımı daha güçlü ve eksiksiz (varsa id/postalCode/street/city/country)
type AddressObj = {
  _id?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  [key: string]: any;
};

export default function FooterCompanyInfo() {
  const company = useAppSelector((state) => state.company.company);
  const { t } = useI18nNamespace("footer", translations);
  if (!company) return null;

  const { email, phone, addresses } = company;

  // Her adres için satır oluşturalım
  const addressBlocks = Array.isArray(addresses)
    ? addresses
        .map((addrRaw, idx) => {
          // Hem populate edilmiş obje hem string destekli
          const addr = typeof addrRaw === "object" && addrRaw !== null
            ? (addrRaw as AddressObj)
            : null;
          if (
            addr &&
            (addr.street || addr.postalCode || addr.city || addr.country)
          ) {
            const line = [addr.street, addr.postalCode, addr.city, addr.country]
              .filter(Boolean)
              .join(", ");
            return (
              <InfoRow key={addr._id || idx}>
                <span>{t("address", "Address")}:</span>
                <span>{line}</span>
              </InfoRow>
            );
          }
          // Eğer string (populate edilmemiş), düz göster
          if (typeof addrRaw === "string" && addrRaw.trim().length > 0) {
            return (
              <InfoRow key={idx}>
                <span>{t("address", "Address")}:</span>
                <span>{addrRaw}</span>
              </InfoRow>
            );
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <FooterBlock>
      <FooterTitle>{t("companyInfo", "Company Info")}</FooterTitle>
      <CompanyLine>
        {email && (
          <InfoRow>
            <span>{t("email", "E-Mail")}:</span>
            <a href={`mailto:${email}`}>{email}</a>
          </InfoRow>
        )}
        {phone && (
          <InfoRow>
            <span>{t("phone", "Telefon")}:</span>
            <a href={`tel:${phone}`}>{phone}</a>
          </InfoRow>
        )}
        {/* Tüm adresler burada */}
        {addressBlocks}
      </CompanyLine>
    </FooterBlock>
  );
}

// --- Styled Components (Aynen kalabilir) ---
const FooterBlock = styled.div`
  margin: 0;
  max-width: 320px;
  width: 100%;
  text-align: left;

  ${({ theme }) => theme.media.small} {
    text-align: center;
    margin: 0 auto;
  }
`;

const FooterTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  letter-spacing: 0.01em;
`;

const CompanyLine = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;

  ${({ theme }) => theme.media.small} {
    align-items: center;
  }
`;

const InfoRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.5;

  span:first-child {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    min-width: 62px;
    opacity: 0.9;
    font-size: 1em;
  }

  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: underline;
    font-weight: 500;
    transition: color ${({ theme }) => theme.transition.fast};
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;
