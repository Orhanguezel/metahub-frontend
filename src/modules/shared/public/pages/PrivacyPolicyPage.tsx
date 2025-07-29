"use client";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/privacy";
import { SupportedLocale } from "@/types/common";

export default function DatenschutzPage(props: {
  companyName?: string;
  companyDesc?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
}) {
  const { i18n, t } = useI18nNamespace("privacy", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const company = useAppSelector((state) => state.company.companyAdmin);

  if (!company) return null;

 // Çoklu dil desteği için firma adı:
  const getCompanyName = () =>
    typeof company.companyName === "object"
      ? company.companyName[lang] || Object.values(company.companyName)[0]
      : company.companyName;

      // Çoklu dil destekli açıklama
  const getCompanyDesc = () => {
    if (company?.companyDesc && typeof company.companyDesc === "object")
      return company.companyDesc[lang] || Object.values(company.companyDesc)[0];
    return company?.companyDesc || props.companyDesc || "";
  };


  // Adres: hem string hem object array destekli
  let addressLine = props.address || "";
  if (company?.addresses && company.addresses.length > 0) {
    const first = company.addresses[0];
    if (typeof first === "string") {
      addressLine = first;
    } else if (typeof first === "object" && first !== null) {
      const addrObj = first as any;
      addressLine = [addrObj.street, addrObj.postalCode, addrObj.city, addrObj.country]
        .filter(Boolean)
        .join(", ");
    }
  }

  const email = company?.email || props.email || "info@firmaniz.de";
  const website = company?.website || props.website || "www.firmaniz.de";
  const phone = company?.phone || props.phone || "";
  const fax = company && "fax" in company ? (company as any).fax : props.fax || "";

  return (
    <Wrapper>
      <h1>{t("datenschutz.title", "Datenschutzerklärung")}</h1>
      <Section>
        <b>{t("datenschutz.status", "Stand")}:</b> Dezember 2025
        <br />
        <br />
        {t("datenschutz.intro1", `Wir freuen uns sehr über Ihr Interesse an unserem Unternehmen.`)}
        <br />{getCompanyName() + t("datenschutz.intro2",
          `misst dem Datenschutz einen besonders hohen Stellenwert bei. Die Nutzung unserer Webseite ist grundsätzlich ohne jede Angabe personenbezogener Daten möglich.`
        )}
        <br />
        {t(
          "datenschutz.intro3",
          `Sofern eine betroffene Person besondere Services unseres Unternehmens über unsere Internetseite in Anspruch nehmen möchte, könnte jedoch eine Verarbeitung personenbezogener Daten erforderlich werden.`
        )}
        <br />
        {t(
          "datenschutz.intro4",
          `Ist die Verarbeitung personenbezogener Daten erforderlich und besteht für eine solche Verarbeitung keine gesetzliche Grundlage, holen wir generell eine Einwilligung der betroffenen Person ein.`
        )}
      </Section>
      <Section>
        <h2>{t("datenschutz.controller", "2. Name und Anschrift des Verantwortlichen")}</h2>
        <b>{getCompanyName()}</b>
        <br />
        {getCompanyDesc() && <>{getCompanyDesc()}<br /></>}
        {addressLine && <>{addressLine}<br /></>}
        {phone && <>Tel.: {phone}<br /></>}
        {fax && <>Fax: {fax}<br /></>}
        {email && <>E-Mail: <a href={`mailto:${email}`}>{email}</a><br /></>}
        {website && (
          <>
            Webseite:{" "}
            <a href={website.startsWith("http") ? website : `https://${website}`}>
              {website.replace(/^https?:\/\//, "")}
            </a>
            <br />
          </>
        )}
      </Section>
      {/* Devamı aynı şekilde... */}
    </Wrapper>
  );
}

// --- Styles ---
const Wrapper = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 2.2rem 1.2rem 3.5rem 1.2rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.09rem;
  h1 {
    font-size: 2.1rem;
    margin-bottom: 1.3rem;
    font-weight: 700;
  }
  h2 {
    font-size: 1.17rem;
    margin: 1.7rem 0 1rem 0;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Section = styled.section`
  margin-bottom: 1.55rem;
  line-height: 1.62;
  b {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }
  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
    word-break: break-all;
  }
  ul {
    margin: 0.45rem 0 0 1.3rem;
    padding: 0;
    li {
      margin: 0.1rem 0;
    }
  }
`;
