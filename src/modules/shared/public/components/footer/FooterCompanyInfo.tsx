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
              {[
                address.street,
                address.postalCode,
                address.city,
              ].filter(Boolean).join(" ")}
            </span>
          </InfoRow>
        )}
      </CompanyLine>
    </FooterBlock>
  );
}


// --- Styled Components (footer linkleriyle aynı başlık formatı) ---
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
