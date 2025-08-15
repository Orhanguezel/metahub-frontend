"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/apartment/locales";
import type { SupportedLocale } from "@/types/common";
import type { IApartment, TranslatedLabel } from "@/modules/apartment/types";

/* ---------- helpers ---------- */
function firstLocaleValue(obj?: TranslatedLabel, preferred?: SupportedLocale) {
  if (!obj) return "";
  if (preferred && obj[preferred] && String(obj[preferred]).trim()) return String(obj[preferred]).trim();
  for (const v of Object.values(obj)) if (typeof v === "string" && v.trim()) return v.trim();
  return "";
}
const asId = (v: any) => (typeof v === "string" ? v : v?._id ? String(v._id) : "");
const boolTxt = (b: boolean, t: any) => (b ? t("common.yes", "Yes") : t("common.no", "No"));

export default function ApartmentDetail({
  item,
  onClose,
}: {
  item?: IApartment | null;
  onClose: () => void;
}) {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  if (!item) return null;
  const lang = (i18n.language || "en").slice(0, 2) as SupportedLocale;

  const title = firstLocaleValue(item.title, lang);
  const content = firstLocaleValue(item.content, lang);

  /* ---------- derived ---------- */
  const neighborhoodLabel =
    firstLocaleValue(item.snapshots?.neighborhoodName, lang) ||
    (typeof item.place?.neighborhood === "object"
      ? firstLocaleValue((item.place.neighborhood as any)?.name, lang) ||
        (item.place.neighborhood as any)?.slug ||
        asId(item.place?.neighborhood)
      : asId(item.place?.neighborhood)) ||
    "-";

  const coords =
    item.location?.coordinates && Array.isArray(item.location.coordinates)
      ? item.location.coordinates
      : undefined;

  // Customer/Manager (populate edilmiş olabilir)
  const customerObj =
    typeof item.customer === "object" && item.customer
      ? (item.customer as any)
      : null;

  // Contact snapshot
  const contact = item.contact;

  // OPS
  const ops = (item as any).ops || {};
  const employees: any[] = Array.isArray(ops.employees) ? ops.employees : [];
  const supervisor = ops.supervisor;
  const services: any[] = Array.isArray(ops.services) ? ops.services : [];
  const notify = ops.notify || {};
  const cashDay = ops.cashCollectionDay;

  const formatEmployee = (e: any) =>
    e?.fullName?.trim?.() ||
    [e?.firstName, e?.lastName].filter(Boolean).join(" ") ||
    e?.email ||
    asId(e) ||
    "-";

  const formatService = (s: any) => {
    const svc = s?.service;
    if (!svc) return "-";
    if (typeof svc === "object") {
      const nm =
        (typeof svc.name === "string" ? svc.name : firstLocaleValue(svc.name, lang)) ||
        svc.code;
      return nm || asId(svc) || "-";
    }
    return String(svc);
  };

  return (
    <Card>
      <Head>
        <div>
          <Title>{title || item.slug}</Title>
          <Small>
            {t("detail.published","Published")}: <b>{boolTxt(item.isPublished, t)}</b>
            {" — "}
            {t("detail.active","Active")}: <b>{boolTxt(item.isActive, t)}</b>
            {" — "}
            {t("detail.city","City")}: <b>{item.address?.city}</b>
            {" — "}
            {t("detail.neighborhood","Neighborhood")}: <b>{neighborhoodLabel}</b>
          </Small>
          {content && <Desc>{content}</Desc>}
        </div>
        <Btn onClick={onClose}>{t("detail.close","Close")}</Btn>
      </Head>

      {!!item.images?.length && (
        <Grid aria-label={t("detail.images","Images")}>
          {item.images.map((img) => (
            <Img
              key={img.url}
              $bg={img.thumbnail || img.webp || img.url}
              role="img"
              aria-label={title || item.slug}
            />
          ))}
        </Grid>
      )}

      {/* ---- Location & Place ---- */}
      <Section>
        <SectionTitle>{t("detail.locationBlock","Location & Place")}</SectionTitle>
        <InfoGrid>
          <Info><K>{t("detail.address","Address")}</K><V>{item.address?.fullText || "-"}</V></Info>
          <Info><K>{t("detail.cityCode","City Code")}</K><V>{item.place?.cityCode || "-"}</V></Info>
          <Info><K>{t("detail.districtCode","District Code")}</K><V>{item.place?.districtCode || "-"}</V></Info>
          <Info><K>{t("detail.zip","ZIP")}</K><V>{item.place?.zip || item.address?.zip || "-"}</V></Info>
          <Info><K>{t("detail.neighborhood","Neighborhood")}</K><V>{neighborhoodLabel}</V></Info>
          <Info>
            <K>{t("detail.coordinates","Coordinates")}</K>
            <V>{coords ? `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}` : "-"}</V>
          </Info>
        </InfoGrid>
      </Section>

      {/* ---- Manager & Contact ---- */}
      {(customerObj || contact) && (
        <Section>
          <SectionTitle>{t("detail.managerBlock","Manager & Contact")}</SectionTitle>
          <InfoGrid>
            {customerObj && (
              <>
                <Info><K>{t("detail.manager.company","Company")}</K><V>{customerObj.companyName || "-"}</V></Info>
                <Info><K>{t("detail.manager.contactName","Contact Name")}</K><V>{customerObj.contactName || "-"}</V></Info>
                <Info><K>{t("detail.manager.email","Email")}</K><V>{customerObj.email || "-"}</V></Info>
                <Info><K>{t("detail.manager.phone","Phone")}</K><V>{customerObj.phone || "-"}</V></Info>
              </>
            )}
            {contact && (
              <>
                <Info><K>{t("detail.contact","Contact (snapshot)")}</K><V>{contact.name || "-"}</V></Info>
                {contact.role && <Info><K>{t("detail.role","Role")}</K><V>{contact.role}</V></Info>}
                {contact.email && <Info><K>{t("detail.email","Email")}</K><V>{contact.email}</V></Info>}
                {contact.phone && <Info><K>{t("detail.phone","Phone")}</K><V>{contact.phone}</V></Info>}
              </>
            )}
          </InfoGrid>
        </Section>
      )}

      {/* ---- Operations ---- */}
      {(employees?.length || supervisor || services?.length || cashDay || notify) && (
        <Section>
          <SectionTitle>{t("detail.opsBlock","Operations")}</SectionTitle>
          <InfoGrid>
            <Info>
              <K>{t("detail.ops.team","Team (employees)")}</K>
              <V>
                {employees?.length
                  ? employees.map((e, i) => <Tag key={asId(e) || i}>{formatEmployee(e)}</Tag>)
                  : "-"}
              </V>
            </Info>
            <Info>
              <K>{t("detail.ops.supervisor","Supervisor")}</K>
              <V>{supervisor ? formatEmployee(supervisor) : "-"}</V>
            </Info>
            <Info>
              <K>{t("detail.ops.services","Services")}</K>
              <V>
                {services?.length
                  ? services.map((s, i) => <Tag key={asId(s?.service) || i}>{formatService(s)}</Tag>)
                  : "-"}
              </V>
            </Info>
            <Info>
              <K>{t("detail.cashDay","Cash collection day")}</K>
              <V>{typeof cashDay === "number" ? cashDay : "-"}</V>
            </Info>
            <Info>
              <K>{t("detail.notify.managerCompleted","Notify manager on completion")}</K>
              <V>{boolTxt(!!notify?.managerOnJobCompleted, t)}</V>
            </Info>
            <Info>
              <K>{t("detail.notify.managerAssigned","Notify manager on assignment")}</K>
              <V>{boolTxt(!!notify?.managerOnJobAssigned, t)}</V>
            </Info>
            <Info>
              <K>{t("detail.notify.employeeAssigned","Notify employee on assignment")}</K>
              <V>{boolTxt(!!notify?.employeeOnJobAssigned, t)}</V>
            </Info>
          </InfoGrid>
        </Section>
      )}

      <Pre aria-label={t("detail.raw","Raw JSON")}>{JSON.stringify(item, null, 2)}</Pre>
    </Card>
  );
}

/* ---------------- styled ---------------- */
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  box-shadow:${({theme})=>theme.cards.shadow};
`;
const Head = styled.div`
  display:flex; align-items:flex-start; justify-content:space-between;
  gap:${({theme})=>theme.spacings.md}; margin-bottom:${({theme})=>theme.spacings.md};
`;
const Title = styled.h3`
  margin:0 0 ${({theme})=>theme.spacings.xs} 0;
  font-size:${({theme})=>theme.fontSizes.medium};
  color:${({theme})=>theme.colors.title};
`;
const Small = styled.div`opacity:.85; font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const Desc = styled.p`margin:${({theme})=>theme.spacings.xs} 0 0; color:${({theme})=>theme.colors.textAlt};`;
const Btn = styled.button`
  align-self:flex-start;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md};
  cursor:pointer; transition:${({theme})=>theme.transition.normal};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover};
    color:${({theme})=>theme.buttons.secondary.textHover}; }
  &:focus-visible{ box-shadow:${({theme})=>theme.colors.shadowHighlight}; outline:none; }
`;

const Section = styled.section`margin:${({theme})=>theme.spacings.md} 0;`;
const SectionTitle = styled.h4`
  margin:0 0 ${({theme})=>theme.spacings.sm} 0;
  font-size:${({theme})=>theme.fontSizes.small};
  color:${({theme})=>theme.colors.textAlt};
`;

const Grid = styled.div`
  display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
  gap:${({theme})=>theme.spacings.sm}; margin:${({theme})=>theme.spacings.sm} 0;
`;
const Img = styled.div<{ $bg: string }>`
  padding-top:66%;
  background-image:${({$bg})=>`url(${$bg})`};
  background-size:cover; background-position:center;
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;

const InfoGrid = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(3,1fr);
  ${({theme})=>theme.media.tablet}{ grid-template-columns:repeat(2,1fr); }
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Info = styled.div`
  background:${({theme})=>theme.colors.backgroundAlt};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.sm};
`;
const K = styled.div`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const V = styled.div`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  color:${({theme})=>theme.colors.textPrimary};
  display:flex; gap:.35rem; flex-wrap:wrap;
`;

const Tag = styled.span`
  background:${({theme})=>theme.colors.tagBackground};
  color:${({theme})=>theme.colors.textSecondary};
  border-radius:${({theme})=>theme.radii.pill};
  padding:2px 8px; font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Pre = styled.pre`
  max-height:420px; overflow:auto;
  font-family:${({theme})=>theme.fonts.mono};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  background:${({theme})=>theme.colors.backgroundAlt};
  color:${({theme})=>theme.colors.text};
  padding:${({theme})=>theme.spacings.sm};
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;
