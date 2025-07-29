"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { useAppSelector } from "@/store/hooks";
import translations from "../../locales/footer";
import type { ICompanyImage } from "@/modules/company/types";
import type { SupportedLocale } from "@/types/common";

const DEFAULT_LOGO = "/default-company-logo.png";

function getCompanyLogo(image?: ICompanyImage): string {
  if (!image) return DEFAULT_LOGO;
  return image.thumbnail || image.url || DEFAULT_LOGO;
}

function isValidSocialUrl(url?: string): boolean {
  return !!url && /^https?:\/\//i.test(url);
}


export default function Footer() {
  const { i18n, t } = useI18nNamespace("footer", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const company = useAppSelector((state) => state.company.companyAdmin);

  if (!company) return null;

  const images: ICompanyImage[] = Array.isArray(company.images) ? company.images : [];
  const getCompanyName = () =>
    typeof company.companyName === "object"
      ? company.companyName[lang] || Object.values(company.companyName)[0]
      : company.companyName;

  type AddressObj = {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    [key: string]: any;
  };

  let addressLine = "";
  if (
    Array.isArray(company.addresses) &&
    company.addresses.length > 0 &&
    typeof company.addresses[0] === "object"
  ) {
    const addr = company.addresses[0] as AddressObj;
    addressLine = [
      addr.street,
      addr.city,
      addr.postalCode,
      addr.country
    ].filter(Boolean).join(", ");
  }

  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          {images.length > 0 ? (
            images.map((logo, idx) => (
              <Logo
                key={(logo.url || logo.thumbnail || "logo") + idx}
                src={getCompanyLogo(logo)}
                alt={`Company Logo ${idx + 1}`}
              />
            ))
          ) : (
            <Logo src={DEFAULT_LOGO} alt="Default Logo" />
          )}
        </LogoSection>
        <InfoSection>
          <CompanyName>{getCompanyName()}</CompanyName>
          <CompanyText>{company.email}</CompanyText>
          <CompanyText>{company.phone}</CompanyText>
          {addressLine && <CompanyText>{addressLine}</CompanyText>}
          {company.socialLinks && (
            <SocialLinks>
              {isValidSocialUrl(company.socialLinks.facebook) && (
                <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              )}
              {isValidSocialUrl(company.socialLinks.instagram) && (
                <a href={company.socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              )}
              {isValidSocialUrl(company.socialLinks.twitter) && (
                <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
              )}
              {isValidSocialUrl(company.socialLinks.linkedin) && (
                <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              )}
              {isValidSocialUrl(company.socialLinks.youtube) && (
                <a href={company.socialLinks.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
              )}
            </SocialLinks>
          )}
        </InfoSection>
      </FooterContent>
      <CopyRight>
        &copy; {new Date().getFullYear()} {getCompanyName()}. {t("footer.rights", "All rights reserved")}.
      </CopyRight>
    </FooterContainer>
  );
}

// --- Responsive Styled Components ---
const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.md};
  text-align: center;
  transition: background-color ${({ theme }) => theme.transition.normal}, color ${({ theme }) => theme.transition.normal};
  width: 100%;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  gap: 2rem;

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0;
    text-align: left;
  }
`;

const LogoSection = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  @media (min-width: 600px) {
    margin-bottom: 0;
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

const Logo = styled.img`
  width: 84px;
  height: 84px;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: transform ${({ theme }) => theme.transition.normal};
  object-fit: contain;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 0 2px 8px rgba(0,0,0,0);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 9px;
  &:hover {
    transform: scale(1.06);
    box-shadow: 0 4px 14px rgba(0,0,0,0.10);
  }
  @media (min-width: 600px) {
    width: 120px;
    height: 120px;
    padding: 14px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  @media (min-width: 600px) {
    align-items: flex-start;
    gap: 0.35em;
  }
`;

const CompanyName = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;
`;

const CompanyText = styled.p`
  margin: ${({ theme }) => theme.spacings.xs} 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  word-break: break-word;
`;

const SocialLinks = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  justify-content: center;
  @media (min-width: 600px) {
    justify-content: flex-start;
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-size: 1em;
    transition: color 0.14s;
    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover || "#0086E0"};
      text-decoration: underline;
    }
  }
`;

const CopyRight = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: ${({ theme }) => theme.opacity.disabled};
  text-align: center;
  word-break: break-word;
`;

