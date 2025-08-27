"use client";

import { ContactFormSection } from "@/modules/contact";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { MdPhone, MdEmail, MdLocationOn, MdWhatsapp } from "react-icons/md";
import { Address } from "@/modules/users/types/address";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export default function ContactPage() {
  const { t } = useI18nNamespace("contact", translations);
  const company = useAppSelector((s) => s.company.company);

  // Adresin okunabilir versiyonu
  let addressLine = "";
  if (Array.isArray(company?.addresses) && company.addresses.length > 0) {
    const addr = company.addresses.find(
      (a): a is Address =>
        typeof a === "object" && a !== null && ("addressLine" in a || "street" in a)
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

  // Whatsapp için company.whatsapp alanını kullanabilirsin, yoksa phone'dan üret
  const whatsappNum = company?.phone || company?.phone;

  return (
    <ContactWrapper>
      <ContactBox>
        <Left>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <PageTitle>
              {t("contactPage.title", "Bize projenizden bahsedin!")}
            </PageTitle>
            <PageDesc>
              {t("contactPage.desc", "Hedeflerinizi tartışmak ve keşfetmek üzere bir toplantı planlamak için ekibimiz en kısa sürede sizinle iletişime geçecek.")}
            </PageDesc>
            <InfoList>
              {company?.email && (
                <InfoRow>
                  <MdEmail />
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </InfoRow>
              )}
              {company?.phone && (
                <InfoRow>
                  <MdPhone />
                  <a href={`tel:${company.phone}`}>{company.phone}</a>
                </InfoRow>
              )}
              {whatsappNum && (
                <InfoRow>
                  <MdWhatsapp />
                  <a href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}`} target="_blank" rel="noopener">
                    Whatsapp: {whatsappNum}
                  </a>
                </InfoRow>
              )}
              {addressLine && (
                <InfoRow>
                  <MdLocationOn />
                  <span>{addressLine}</span>
                </InfoRow>
              )}
            </InfoList>
          </motion.div>
        </Left>
        <Right>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <ContactCard>
              <ContactFormSection />
            </ContactCard>
            <FormFooter>
              {t("contactPage.privacyPre", "Bu formu göndererek")}{" "}
              <a href="/privacy-policy" target="_blank" rel="noopener">
                {t("contactPage.privacyLink", "Aydınlatma Metni")}
              </a>
              {t("contactPage.privacyPost", "'ni okuduğumu ve kabul ettiğimi onaylıyorum.")}
            </FormFooter>
          </motion.div>
        </Right>
      </ContactBox>
    </ContactWrapper>
  );
}

// --- Styles ---

const ContactWrapper = styled.div`
  min-height: 82vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 8px 32px 8px;
`;

const ContactBox = styled.div`
  max-width: 1160px;
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 4px 48px 0 #0002;
  display: flex;
  flex-direction: row;
  gap: 48px;
  padding: 0;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0;
    max-width: 99vw;
    box-shadow: none;
    padding: 0;
  }
`;

const Left = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 74px 46px 44px 58px;
  @media (max-width: 900px) {
    padding: 34px 10px 18px 10px;
    align-items: center;
    text-align: center;
  }
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.title};
  font-size: clamp(2.8rem, 6vw, 3.7rem);
  font-weight: 900;
  margin-bottom: 22px;
  letter-spacing: -0.018em;
  line-height: 1.13;
`;

const PageDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1.12rem, 2.8vw, 1.44rem);
  font-weight: 400;
  margin-bottom: 38px;
  line-height: 1.44;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 38px;
  font-size: 1.13em;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.13em;
  a, span {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    text-decoration: none;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
    word-break: break-all;
  }
  svg {
    font-size: 1.49em;
    opacity: 0.82;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Right = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 54px 40px;
  margin: 24px 28px 24px 0;

  @media (max-width: 900px) {
    border-radius: ${({ theme }) => theme.radii.lg};
    padding: 20px 6px;
    margin: 0;
  }
`;

const ContactCard = styled.div`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 3px 18px 0 #0001;
  background: none;
  padding: 0;
`;

const FormFooter = styled.div`
  font-size: 1.02em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 26px;
  text-align: left;
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    font-weight: 500;
  }
  @media (max-width: 900px) {
    text-align: center;
    font-size: 0.98em;
  }
`;
