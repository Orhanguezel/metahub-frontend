"use client";

import styled, { css } from "styled-components";

import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";

export default function FooterCompanyInfo() {
  const company = useAppSelector((state) => state.company?.company);
  const { t } = useTranslation("footer");

  if (!company) return null;

  const { companyName, email, phone, address } = company;

  // Label'lar çok dilli (footer.json'da: email, phone, address anahtarları olmalı)
  return (
    <InfoWrapper>
      <CompanyName>{companyName}</CompanyName>
      <CompanyLine>
        {email && (
          <InfoRow>
            <span>{t("email", "E-Mail")}:</span>
            <a href={`mailto:${email}`}>{email}</a>
          </InfoRow>
        )}
        {phone && (
          <InfoRow>
            <span>{t("phone", "Tel")}:</span>
            <a href={`tel:${phone}`}>{phone}</a>
          </InfoRow>
        )}
        {address && (
          <InfoRow>
            <span>{t("address", "Adres")}:</span>
            <span>
              {address.street}, {address.postalCode} {address.city}
            </span>
          </InfoRow>
        )}
      </CompanyLine>
    </InfoWrapper>
  );
}

const InfoWrapper = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const FooterBlockTitle = css`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CompanyName = styled.div`
  ${FooterBlockTitle}
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
