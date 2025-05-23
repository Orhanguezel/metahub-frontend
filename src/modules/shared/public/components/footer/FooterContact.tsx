"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";

export interface ContactInfo {
  [key: string]: string | undefined;
}

interface FooterContactProps {
  contactInfo?: ContactInfo;
  title?: string; // Opsiyonel başlık override
}

export default function FooterContact({
  contactInfo,
  title,
}: FooterContactProps) {
  const { t } = useTranslation("footer");

  if (!contactInfo || Object.keys(contactInfo).length === 0) return null;

  return (
    <FooterBlock>
      <h3>{title || t("contact")}</h3>
      {Object.entries(contactInfo).map(([fieldKey, fieldValue]) => {
        if (!fieldValue) return null;

        const lowerKey = fieldKey.toLowerCase();

        if (lowerKey.includes("email")) {
          return (
            <p key={fieldKey}>
              {t("email")}: <a href={`mailto:${fieldValue}`}>{fieldValue}</a>
            </p>
          );
        }

        if (lowerKey.includes("phone")) {
          return (
            <p key={fieldKey}>
              {t("phone")}: <a href={`tel:${fieldValue}`}>{fieldValue}</a>
            </p>
          );
        }

        return <p key={fieldKey}>{fieldValue}</p>;
      })}
    </FooterBlock>
  );
}

const FooterBlock = styled.div`
  margin: ${({ theme }) => theme.spacing.md};
  max-width: 300px;

  h3 {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  p,
  strong,
  a {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    text-decoration: none;
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  ${({ theme }) => theme.media.small} {
    text-align: center;
  }
`;
