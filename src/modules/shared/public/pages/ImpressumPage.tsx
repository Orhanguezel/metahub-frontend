"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { useAppSelector } from "@/store/hooks";
import translations from "../../locales/impressum";
import { SupportedLocale } from "@/types/common";

export default function ImpressumPage(props: {
  companyName?: string;
  companyDesc?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  managers?: string | string[];
  registerCourt?: string;
  registerNumber?: string;
  vatNumber?: string;
}) {
  const { i18n, t } = useI18nNamespace("impressum", translations);
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

  // Adres: string[] veya object[] olabilir
  let addressLine = props.address || "";
  if (company?.addresses && company.addresses.length > 0) {
    const first = company.addresses[0];
    if (typeof first === "string") {
      addressLine = first;
    } else if (typeof first === "object" && first !== null) {
      // Dinamik olarak bilinen key'leri çek (Address tipine gerek yok)
      const addrObj = first as any;
      addressLine = [addrObj.street, addrObj.postalCode, addrObj.city, addrObj.country]
        .filter(Boolean)
        .join(", ");
    }
  }

  // Managers: array veya string
  const managers = Array.isArray(company?.managers)
    ? company.managers.join(", ")
    : company?.managers || props.managers || "";

  const phone = company?.phone || props.phone || "";
  const fax = company && "fax" in company ? (company as any).fax : props.fax || ""; // Eğer varsa
  const email = company?.email || props.email || "";
  const website = company?.website || props.website || "";
  const registerCourt = company?.registerCourt || props.registerCourt || "";
  const registerNumber =
    company?.handelsregisterNumber ||
    props.registerNumber ||
    "";
  const vatNumber = company?.taxNumber || props.vatNumber || "";

  return (
    <Wrapper>
      <h1>{t("impressumTitle", "Impressum / Yasal Bilgilendirme")}</h1>
      <Section>
        <b>{getCompanyName()}</b>
        <br />
        {getCompanyDesc()}
        <br />
        <br />
        {addressLine}
        <br />
        <br />
        {t("phone", "Telefon")}: {phone}
        <br />
        {fax && (
          <>
            {t("fax", "Faks")}: {fax}
            <br />
          </>
        )}
        {t("email", "E-Posta")}: <a href={`mailto:${email}`}>{email}</a>
        <br />
        {t("website", "İnternet")}:{" "}
        <a
          href={
            website.startsWith("http")
              ? website
              : `https://${website.replace(/^https?:\/\//, "")}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {website}
        </a>
      </Section>

      <Section>
        <b>{t("managersTitle", "Yetkili Temsilciler")}:</b>
        <br />
        {managers}
      </Section>

      <Section>
        <b>{t("tradeInfo", "Ticaret Sicil Bilgisi")}:</b>
        <br />
        {t("registerCourt", "Kayıtlı Mahkeme")}: {registerCourt}
        <br />
        {t("registerNumber", "Ticaret Sicil Numarası")}: {registerNumber}
      </Section>

      <Section>
        <b>
          {t(
            "vatTitle",
            "Katma Değer Vergisi (Umsatzsteuer-Identifikationsnummer)"
          )}
          :
        </b>
        <br />
        {vatNumber}
      </Section>

      <Section>
        <b>{t("liabilityTitle", "Sorumluluk Reddi")}</b>
        <br />
        {t(
          "liabilityText",
          `Sitemizden verilen harici bağlantılar, içerikleri üzerinde hiçbir kontrolümüz olmayan üçüncü taraf sitelere yönlendirebilir.
        Bağlantı verilen sayfaların içeriklerinden ve yasal sonuçlarından ${getCompanyName()} sorumlu değildir. Yalnızca ilgili sayfanın sahibi sorumludur.`
        )}
      </Section>

      <Section>
        <b>{t("privacyTitle", "Veri Koruma")}</b>
        <br />
        {t(
          "privacyText",
          `Bu web sitesi, ziyaretçi istatistiklerini analiz etmek için çerezler (cookies) kullanabilir.
        Çerezlerin kullanımını tarayıcı ayarlarınızdan kısıtlayabilir veya engelleyebilirsiniz.
        Ayrıca, ${getCompanyName()} gizlilik politikası ve kişisel verilerin korunması ile ilgili olarak `
        )}
        <a href="/privacy-policy">{t("privacyPolicy", "Gizlilik Politikamıza")}</a> {t("privacyContinue", "göz atabilirsiniz.")}        
      </Section>
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
  font-size: 1.12rem;
  h1 {
    font-size: 2.2rem;
    margin-bottom: 1.3rem;
    font-weight: 700;
  }
`;

const Section = styled.section`
  margin-bottom: 1.9rem;
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
`;
