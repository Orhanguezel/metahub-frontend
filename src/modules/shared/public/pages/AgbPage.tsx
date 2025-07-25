"use client";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/terms";
import { SupportedLocale } from "@/types/common";

export default function AgbPage(props: {
  companyName?: string;
  address?: string;
  email?: string;
  website?: string;
  phone?: string;
  fax?: string;
}) {
  const { i18n, t } = useI18nNamespace("terms", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const company = useAppSelector((state) => state.company.companyAdmin);

  if (!company) return null;

  // Dinamik şirket adı
  const getCompanyName = () =>
    typeof company.companyName === "object"
      ? company.companyName[lang] || Object.values(company.companyName)[0]
      : company.companyName;

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
      <h1>{t("agb.title", "Allgemeine Geschäftsbedingungen (AGB)")}</h1>
      <CompanyInfo>
        <b>{getCompanyName()}</b>
        <br />
        {addressLine && <>{addressLine}<br /></>}
        {phone && <>Telefon: {phone}<br /></>}
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
        <br />
        <span>{t("agb.stand", "Stand")} April 2020</span>
      </CompanyInfo>

      {/* --------- AGB SECTIONS --------- */}
      <Section>
        <h2>§1 {t("agb.s1_title", "Geltungsbereich")}</h2>
        <p>{t("agb.s1_p1", "Diese Geschäftsbedingungen gelten für alle gegenwärtigen und zukünftigen Geschäftsbeziehungen mit Unternehmen. Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen werden, selbst bei Kenntnis, nicht Vertragsbestandteil, es sei denn, ihre Geltung wird ausdrücklich schriftlich anerkannt.")}</p>
      </Section>

      <Section>
        <h2>§2 {t("agb.s2_title", "Vertragsabschluss")}</h2>
        <p>{t("agb.s2_p1", "Unsere Angebote sind freibleibend. Der Zwischenverkauf bleibt vorbehalten.")}</p>
        <p>{t("agb.s2_p2", "Technische Änderungen sowie Änderungen in Form, Farbe und/Gewicht bleiben im Rahmen des Zumutbaren vorbehalten. Abbildungen, Zeichnungen, Gewichts- und Maßangaben sind nur annähernd maßgebend, soweit sie nicht ausdrücklich schriftlich als verbindlich bezeichnet werden.")}</p>
        <p>{t("agb.s2_p3", "An Abbildungen, Zeichnungen, Kalkulationen und sonstigen Unterlagen behalten wir uns Eigentums- und Urheberrechte vor. Sie dürfen Dritten nicht zugänglich gemacht werden.")}</p>
        <p>{t("agb.s2_p4", "Das Eigentum geht mit vollständiger Bezahlung der gelieferten Waren auf den Kunden über.")}</p>
      </Section>

      <Section>
        <h2>§3 {t("agb.s3_title", "Preise")}</h2>
        <p>{t("agb.s3_p1", "Die Preise verstehen sich zzgl. Mehrwertsteuer ab Lager ausschließlich Verpackung, Transport und Versicherung.")}</p>
        <p>{t("agb.s3_p2", "Für Waren und Leistungen, die später als vier Monate nach Vertragsschluss geliefert oder erbracht werden, haben wir das Recht zu Preiserhöhungen oder Preissenkungen, soweit sich die Kosten aufgrund von Tarifabschlüssen, Änderungen von Fracht-, Versand- und Versandnebenkosten und Materialpreise verändert haben.")}</p>
      </Section>

      <Section>
        <h2>§4 {t("agb.s4_title", "Lieferung / Gefahrübergang")}</h2>
        <p>{t("agb.s4_p1", "Liefertermine und -fristen sind unverbindlich.")}</p>
        <p>{t("agb.s4_p2", "Die Versendung erfolgt auf Gefahr und Rechnung des Kunden. Versandart und Versandweg werden von uns nach Absprache mit dem Kunden gewählt.")}</p>
      </Section>

      <Section>
        <h2>§5 {t("agb.s5_title", "Zahlungsbedingungen")}</h2>
        <p>{t("agb.s5_p1", "Lieferung von Maschinen und Anlagen: 1/3 bei Vertragsschluss (Auftragsbestätigung), 1/3 bei Meldung der Versandbereitschaft, 1/3 bei Lieferung. Rechnungsbeträge sind innerhalb von 30 Tagen nach Rechnungsdatum ohne Abzug zu bezahlen.")}</p>
        <p>{t("agb.s5_p2", "Bei Überschreiten des Zahlungstermins tritt ohne Mahnung Zahlungsverzug ein. Während des Verzugs ist der Rechnungsbetrag mit 9 %-Punkten über dem Basiszinssatz unter Vorbehaltung der Geltendmachung eines weiteren Verzugsschadens zu verzinsen.")}</p>
      </Section>

      <Section>
        <h2>§6 {t("agb.s6_title", "Eigentumsvorbehalt")}</h2>
        <p>{t("agb.s6_p1", "Die gelieferte Ware bleibt bis zur Zahlung des Kaufpreises und Tilgung aller aus der Geschäftsverbindung bestehenden Forderungen und der im Zusammenhang mit dem Kaufgegenstand noch entstehenden Forderungen als Vorbehaltsware Eigentum des Verkäufers.")}</p>
        <p>{t("agb.s6_p2", "Der Kunde ist verpflichtet, die Ware pfleglich zu behandeln.")}</p>
      </Section>

      <Section>
        <h2>§7 {t("agb.s7_title", "Gewährleistung")}</h2>
        <p>{t("agb.s7_p1", "Wir leisten für Mängel der Ware zunächst nach unserer Wahl Gewähr durch Nachbesserung oder Ersatzlieferung.")}</p>
        <p>{t("agb.s7_p2", "Schlägt die Nacherfüllung fehl, kann der Kunde grundsätzlich nach seiner Wahl Herabsetzung der Vergütung (Minderung) oder Rückgängigmachung des Vertrages (Rücktritt) verlangen.")}</p>
      </Section>

      <Section>
        <h2>§8 {t("agb.s8_title", "Haftung")}</h2>
        <p>{t("agb.s8_p1", "Bei leicht fahrlässigen Pflichtverletzungen beschränkt sich unsere Haftung auf den nach der Art der Ware vorhersehbaren, vertragstypischen, unmittelbaren Durchschnittschaden.")}</p>
        <p>{t("agb.s8_p2", "Die vorstehende Haftungsbeschränkung betrifft nicht Ansprüche aus Produkthaftung.")}</p>
      </Section>

      <Section>
        <h2>§9 {t("agb.s9_title", "Höhere Gewalt / Rücktritt")}</h2>
        <p>{t("agb.s9_p1", "Im Falle höherer Gewalt, Streik, Aussperrung oder sonstiger erheblicher Betriebs- oder Absatzstörungen sind wir unter Berücksichtigung der Interessen des Kunden für die Dauer der Störung und dem Umfang ihrer Wirkung von der Verpflichtung zur Leistung befreit.")}</p>
        <p>{t("agb.s9_p2", "Bei dauerhaften Ereignissen sind wir zum Rücktritt berechtigt.")}</p>
      </Section>

      <Section>
        <h2>§10 {t("agb.s10_title", "Schlussbestimmungen")}</h2>
        <p>{t("agb.s10_p1", "Der Kunde darf seine Rechte aus dem Vertrag nur mit unserer schriftlichen Zustimmung ganz oder teilweise auf Dritte übertragen.")}</p>
        <p>{t("agb.s10_p2", "Es gilt das Recht der Bundesrepublik Deutschland. Die Bestimmungen des UN-Kaufrechts finden keine Anwendung.")}</p>
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

const CompanyInfo = styled.div`
  margin-bottom: 1.5rem;
  font-size: 1.07rem;
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

const Section = styled.section`
  margin-bottom: 1.55rem;
  line-height: 1.62;
  p {
    margin: 0.35rem 0;
  }
`;
