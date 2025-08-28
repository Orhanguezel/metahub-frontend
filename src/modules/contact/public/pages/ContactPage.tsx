"use client";

import { ContactFormSection, LocationMapSection } from "@/modules/contact";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
import { Address } from "@/modules/users/types/address";

export default function ContactPage() {
  const company = useAppSelector((s) => s.company.company);

  // En az bir iletişim bilgisi varsa göster
  const showContactInfo =
    company?.phone || company?.email || (company?.addresses && company.addresses.length > 0);

  let addressLine = "";

if (Array.isArray(company?.addresses) && company.addresses.length > 0) {
  const addr = company.addresses.find(
    (a): a is Address => typeof a === "object" && a !== null && ("addressLine" in a || "street" in a)
  );
  if (addr) {
    addressLine = [
      addr.street,
      addr.postalCode,
      addr.city,
      addr.country,
    ].filter(Boolean).join(", ");
  }
}

  return (
    <ContactContainer>
      <SectionFlex>
        <FlexItem>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ContactFormSection />
          </motion.div>
        </FlexItem>
        <FlexItem>
          {showContactInfo && (
            <ContactInfoCard>
              {company?.phone && (
                <InfoRow>
                  <MdPhone />
                  <a href={`tel:${company.phone}`}>{company.phone}</a>
                </InfoRow>
              )}
              {company?.email && (
                <InfoRow>
                  <MdEmail />
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </InfoRow>
              )}
              {addressLine && (
                <InfoRow>
                  <MdLocationOn />
                  <span>{addressLine}</span>
                </InfoRow>
              )}
            </ContactInfoCard>
          )}
          <LocationMapSection />
        </FlexItem>
      </SectionFlex>
    </ContactContainer>
  );
}

const ContactContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 16px 32px 16px;
`;

const SectionFlex = styled.div`
  display: flex;
  gap: 36px;
  margin: 40px 0;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 20px;
    margin: 24px 0;
  }
`;

const FlexItem = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
`;

// --- CONTACT INFO CARD ---
const ContactInfoCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 18px 18px 12px 18px;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: 14px;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    padding: 13px 10px 10px 10px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  a, span {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    text-decoration: none;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
    word-break: break-all;
  }
  svg {
    font-size: 1.4em;
    opacity: 0.76;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

