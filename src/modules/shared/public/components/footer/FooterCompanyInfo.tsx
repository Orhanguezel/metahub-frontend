"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";

// Address tipini basit tanımla, types'tan import edebilirsin istersen:
type AddressObj = {
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

  // Adres (ilk populate ise object, değilse string)
  let addressLine = "";
  if (
    Array.isArray(addresses) &&
    addresses.length > 0 &&
    typeof addresses[0] === "object"
  ) {
    const addr = addresses[0] as AddressObj;
    addressLine = [
      addr.street,
      addr.postalCode,
      addr.city,
      addr.country,
    ]
      .filter(Boolean)
      .join(" ");
  }

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
        {addressLine && (
          <InfoRow>
            <span>{t("address", "Address")}:</span>
            <span>{addressLine}</span>
          </InfoRow>
        )}
      </CompanyLine>
    </FooterBlock>
  );
}

// --- Styled Components (footer linkleriyle aynı başlık formatı) ---
// (Aynen kalsın)
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
