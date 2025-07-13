"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";


// Başlığı parentten prop ile göndermek de mümkündür, şimdilik component içinde sabit tutuldu.
export default function FooterCompanyInfo() {
  const company = useAppSelector((state) => state.company.company);
   const { t } = useI18nNamespace("footer", translations);

  if (!company) return null;

  const { email, phone, address } = company;

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
        {address && (
          <InfoRow>
            <span>{t("address", "Address")}:</span>
            <span>
              {/* Adresin her bir alanını güvenli şekilde birleştiriyoruz */}
              {[
                address.street,
                address.postalCode,
                address.city,
              ]
                .filter(Boolean)
                .join(" ")}
            </span>
          </InfoRow>
        )}
      </CompanyLine>
    </FooterBlock>
  );
}

// --- Styled Components (footer linkleriyle aynı başlık formatı) ---
const FooterTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const FooterBlock = styled.div`
  margin: ${({ theme }) => theme.spacings.md};
  max-width: 300px;
  text-align: center;
`;

const CompanyLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.2s;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  span:first-child {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    min-width: 55px;
  }
`;
