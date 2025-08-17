"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/offer/locales";
import type { IOffer, OfferStatus } from "@/modules/offer/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateOfferStatus } from "@/modules/offer/slice/offerSlice";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getMultiLang,
} from "@/types/common";

/* ---------- tiny utils ---------- */
const normalizeLang = (l?: string): SupportedLocale => {
  const two = String(l || "en").toLowerCase().slice(0, 2) as SupportedLocale;
  return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "en";
};

const getId = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v._id === "string") return v._id;
  if (typeof v?.$oid === "string") return String(v.$oid);
  if (typeof v?._id?.$oid === "string") return String(v._id.$oid);
  if (typeof v?.id === "string") return v.id;
  return "";
};

const toDateStr = (v: any) => {
  if (!v) return "—";
  const d =
    typeof v === "string" || v instanceof Date
      ? new Date(v)
      : typeof v?.$date === "string" || typeof v?.$date === "number"
      ? new Date(v.$date)
      : null;
  return d && !isNaN(+d) ? d.toLocaleDateString() : "—";
};

const toArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.list)) return raw.list;
    const firstArr = Object.values(raw).find((x: any) => Array.isArray(x)) as any[] | undefined;
    if (firstArr) return firstArr;
  }
  return [];
};

type Props = { item: IOffer; onClose: () => void };

export default function OfferDetail({ item, onClose }: Props) {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const lang = normalizeLang(i18n.language);
  const dispatch = useAppDispatch();

  /* ---------- store lookups (company/customer adı id’den bulunur) ---------- */
  const companiesRaw = useAppSelector((s: any) =>
    s?.company?.companyAdmin ?? s?.companies?.admin ?? s?.company?.items ?? []
  );
  const customersRaw = useAppSelector((s: any) =>
    s?.customer?.customerAdmin ?? s?.customers?.admin ?? s?.customer?.items ?? []
  );
  const companies = toArray(companiesRaw);
  const customers = toArray(customersRaw);

  const companyById = useMemo(
    () => Object.fromEntries(companies.map((c: any) => [getId(c) || String(c?._id ?? ""), c])),
    [companies]
  );
  const customerById = useMemo(
    () => Object.fromEntries(customers.map((c: any) => [getId(c) || String(c?._id ?? ""), c])),
    [customers]
  );

  /* ---------- local status + pending state ---------- */
  const [pending, setPending] = useState<OfferStatus | null>(null);
  const [localStatus, setLocalStatus] = useState<OfferStatus>(item.status as OfferStatus);

  const doSet = async (status: OfferStatus) => {
    try {
      setPending(status);
      const offerId = getId((item as any)?._id || item);
      await (dispatch(updateOfferStatus({ id: offerId, status }) as any).unwrap());
      setLocalStatus(status);
    } finally {
      setPending(null);
    }
  };

  /* ---------- multi-lang text helper ---------- */
  const toText = (v?: Record<string, string> | string): string => {
    if (v == null) return "—";
    if (typeof v === "string") return v;
    return getMultiLang(v, lang) || "—";
  };

  const fmtMoney = (n?: number, currency?: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "EUR",
      }).format(Number(n) || 0);
    } catch {
      const x = Number(n) || 0;
      return `${x.toFixed(2)} ${currency || ""}`.trim();
    }
  };

  /* ---------- robust names ---------- */
  const resolveCompanyName = (): string => {
    const v: any = (item as any).company;
    if (!v) return "—";
    if (typeof v === "string") {
      const hit = companyById[v];
      return hit ? (toText(hit.companyName) || toText(hit.name)) : v;
    }
    const byId = companyById[getId(v)];
    return (
      toText(v.companyName) ||
      toText(v.name) ||
      (byId ? toText(byId.companyName) || toText(byId.name) : "—")
    );
  };

  const resolveCustomerName = (): string => {
    const v: any = (item as any).customer;
    if (!v) return "—";
    if (typeof v === "string") {
      const hit = customerById[v];
      return hit
        ? toText((hit as any).companyName) ||
            toText((hit as any).contactName) ||
            toText((hit as any).name)
        : v;
    }
    const byId = customerById[getId(v)];
    return (
      toText(v.companyName) ||
      toText(v.contactName) ||
      toText(v.name) ||
      (byId
        ? toText((byId as any).companyName) ||
          toText((byId as any).contactName) ||
          toText((byId as any).name)
        : "—")
    );
  };

  const customerName = resolveCustomerName();
  const companyName = resolveCompanyName();

  /* ---------- pdf fallback ---------- */
  const lastRevPdf =
    Array.isArray((item as any).revisionHistory) &&
    (item as any).revisionHistory.length
      ? (item as any).revisionHistory[(item as any).revisionHistory.length - 1]?.pdfUrl
      : undefined;
  const pdfUrl = (item as any).pdfUrl || lastRevPdf || "";

  /* ---------- totals fallback on each line ---------- */
  const lineTotal = (it: any): number => {
    if (typeof it?.total === "number") return it.total;
    const unit = Number(it?.customPrice ?? it?.unitPrice ?? 0);
    const qty = Number(it?.quantity ?? 0);
    const vat = Number(it?.vat ?? 0);
    const net = unit * qty;
    return Math.round(net * (1 + vat / 100) * 100) / 100;
    // (küçük yuvarlama: 2 ondalık)
  };

  return (
    <Wrap>
      <HeadRow>
        <HeadLeft>
          <H4>{(item as any).offerNumber || "—"}</H4>
          <Badge data-status={localStatus}>
            {t(`status.${localStatus}`, localStatus)}
          </Badge>
        </HeadLeft>

        <IconBtn onClick={onClose} aria-label={t("common.close", "Close")}>×</IconBtn>
      </HeadRow>

      <Grid3>
        <Box>
          <Title>{t("detail.customer", "Customer")}</Title>
          <Small>{customerName}</Small>
        </Box>
        <Box>
          <Title>{t("detail.company", "Company")}</Title>
          <Small>{companyName}</Small>
        </Box>
        <Box>
          <Title>{t("detail.validUntil", "Valid until")}</Title>
          <Small>{toDateStr((item as any).validUntil)}</Small>
        </Box>
      </Grid3>

      <SectionTitle>{t("detail.items", "Items")}</SectionTitle>

      {/* Desktop/tablet */}
      <TableWrap className="desktop" aria-label={t("detail.itemsTable", "Items table")}>
        <Table>
          <thead>
            <tr>
              <th>{t("item.type", "Type")}</th>
              <th>{t("item.name", "Name")}</th>
              <th>{t("item.qty", "Qty")}</th>
              <th>{t("item.unit", "Unit")}</th>
              <th>{t("item.vat", "VAT %")}</th>
              <th>{t("item.total", "Total")}</th>
            </tr>
          </thead>
          <tbody>
            {(item.items || []).map((it: any, idx: number) => {
              const name =
                toText(it.productName) ||
                toText(it?.ensotekprod?.name) ||
                toText(it?.sparepart?.name) ||
                "—";
              return (
                <tr key={idx}>
                  <td>{it.productType}</td>
                  <td>{name}</td>
                  <td>{it.quantity}</td>
                  <td>{fmtMoney(it.unitPrice ?? it.customPrice, (item as any).currency)}</td>
                  <td>{it.vat}</td>
                  <td>{fmtMoney(lineTotal(it), (item as any).currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile */}
      <CardList className="mobile">
        {(item.items || []).map((it: any, idx: number) => {
          const name =
            toText(it.productName) ||
            toText(it?.ensotekprod?.name) ||
            toText(it?.sparepart?.name) ||
            "—";
          return (
            <ItemCard key={idx}>
              <RowBetween>
                <Chip>{it.productType}</Chip>
                <b>{fmtMoney(lineTotal(it), (item as any).currency)}</b>
              </RowBetween>
              <ItemName>{name}</ItemName>

              <MetaGrid>
                <Meta>
                  <MetaLabel>{t("item.qty", "Qty")}</MetaLabel>
                  <MetaVal>{it.quantity}</MetaVal>
                </Meta>
                <Meta>
                  <MetaLabel>{t("item.unit", "Unit")}</MetaLabel>
                  <MetaVal>{fmtMoney(it.unitPrice ?? it.customPrice, (item as any).currency)}</MetaVal>
                </Meta>
                <Meta>
                  <MetaLabel>{t("item.vat", "VAT %")}</MetaLabel>
                  <MetaVal>{it.vat}</MetaVal>
                </Meta>
              </MetaGrid>
            </ItemCard>
          );
        })}
      </CardList>

      <Totals>
        <div>
          <span>{t("detail.subtotal", "Subtotal")}</span>
          <b>{fmtMoney((item as any).totalNet, (item as any).currency)}</b>
        </div>
        <div>
          <span>{t("detail.vat", "VAT")}</span>
          <b>{fmtMoney((item as any).totalVat, (item as any).currency)}</b>
        </div>
        {!!(item as any).shippingCost && (
          <div>
            <span>{t("detail.shipping", "Shipping")}</span>
            <b>{fmtMoney((item as any).shippingCost, (item as any).currency)}</b>
          </div>
        )}
        {!!(item as any).additionalFees && (
          <div>
            <span>{t("detail.fees", "Fees")}</span>
            <b>{fmtMoney((item as any).additionalFees, (item as any).currency)}</b>
          </div>
        )}
        {!!(item as any).discount && (
          <div>
            <span>{t("detail.discount", "Discount")}</span>
            <b>- {fmtMoney((item as any).discount, (item as any).currency)}</b>
          </div>
        )}
        <Grand>
          <span>{t("detail.grandTotal", "Grand total")}</span>
          <strong>{fmtMoney((item as any).totalGross, (item as any).currency)}</strong>
        </Grand>
      </Totals>

      <Actions>
        <Ghost
          as="a"
          href={pdfUrl || "#"}
          target="_blank"
          rel="noreferrer"
          data-disabled={!pdfUrl}
          aria-disabled={!pdfUrl}
        >
          {t("detail.viewPdf", "View PDF")}
        </Ghost>
        <Spacer />
        <SmallBtn
          onClick={() => doSet("sent")}
          disabled={pending !== null || localStatus === "sent"}
          aria-disabled={pending !== null || localStatus === "sent"}
        >
          {pending === "sent" ? t("common.loading","Loading…") : t("actions.markSent","Mark as Sent")}
        </SmallBtn>
        <SmallBtn
          onClick={() => doSet("approved")}
          disabled={pending !== null}
          aria-disabled={pending !== null}
        >
          {pending === "approved" ? t("common.loading","Loading…") : t("actions.approve","Approve")}
        </SmallBtn>
        <Danger
          onClick={() => doSet("rejected")}
          disabled={pending !== null}
          aria-disabled={pending !== null}
        >
          {pending === "rejected" ? t("common.loading","Loading…") : t("actions.reject","Reject")}
        </Danger>
      </Actions>
    </Wrap>
  );
}

/* ============ styled ============ */
const Wrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const HeadRow = styled.div`display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};`;
const HeadLeft = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center;`;
const H4 = styled.h4`margin:0; font-size:${({theme})=>theme.fontSizes.md}; color:${({theme})=>theme.colors.title};`;
const IconBtn = styled.button`
  width:36px; height:36px; border-radius:${({theme})=>theme.radii.circle};
  border:${props => props.theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.backgroundAlt}; cursor:pointer; font-size:22px; line-height:1;
  &:hover{ opacity:${({theme})=>theme.opacity.hover}; }
`;
const Badge = styled.span`
  padding:4px 10px; border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.tagBackground};
  &[data-status="approved"]{ background:#d1f5dd; }
  &[data-status="rejected"]{ background:#ffe3e3; }
  &[data-status="sent"]{ background:#e8edf5; }
`;
const Grid3 = styled.div`display:grid; gap:${({theme})=>theme.spacings.md}; grid-template-columns:repeat(3,minmax(0,1fr)); ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }`;
const Box = styled.div`padding:${({theme})=>theme.spacings.md}; border-radius:${({theme})=>theme.radii.lg}; background:${({theme})=>theme.colors.cardBackground}; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};`;
const Title = styled.div`color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const Small = styled.div`font-weight:${({theme})=>theme.fontWeights.medium};`;
const SectionTitle = styled.h4`margin:0; font-size:${({theme})=>theme.fontSizes.md}; color:${({theme})=>theme.colors.title};`;
const TableWrap = styled.div`overflow:auto; &.desktop{display:block;} &.mobile{display:none;} ${({theme})=>theme.media.mobile}{ &.desktop{display:none;} }`;
const Table = styled.table`
  width:100%; border-collapse:separate; border-spacing:0;
  th,td{ padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md}; text-align:left; vertical-align:top; word-break:break-word; }
  thead th{ background:${({theme})=>theme.colors.tableHeader}; position:sticky; top:0; z-index:1; }
  tbody tr:nth-child(even){ background:${({theme})=>theme.colors.backgroundAlt}; }
`;
const CardList = styled.div`display:none; ${({theme})=>theme.media.mobile}{ display:grid; gap:${({theme})=>theme.spacings.sm}; }`;
const ItemCard = styled.div`background:${({theme})=>theme.cards.background}; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.lg}; padding:${({theme})=>theme.spacings.md}; box-shadow:${({theme})=>theme.cards.shadow};`;
const RowBetween = styled.div`display:flex; align-items:center; justify-content:space-between; margin-bottom:${({theme})=>theme.spacings.xs};`;
const Chip = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall}; padding:2px 8px; border-radius:${({theme})=>theme.radii.pill}; background:${({theme})=>theme.colors.tagBackground};`;
const ItemName = styled.div`font-weight:${({theme})=>theme.fontWeights.medium}; margin-bottom:${({theme})=>theme.spacings.xs};`;
const MetaGrid = styled.div`display:grid; gap:${({theme})=>theme.spacings.xs}; grid-template-columns:repeat(3,minmax(0,1fr));`;
const Meta = styled.div`background:${({theme})=>theme.colors.inputBackground}; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight}; border-radius:${({theme})=>theme.radii.md}; padding:8px 10px;`;
const MetaLabel = styled.div`color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const MetaVal = styled.div`font-weight:${({theme})=>theme.fontWeights.medium};`;
const Totals = styled.div`margin-left:auto; width:min(420px,100%); display:flex; flex-direction:column; gap:6px; > div{ display:flex; align-items:center; justify-content:space-between; }`;
const Grand = styled.div`padding-top:${({theme})=>theme.spacings.sm}; margin-top:${({theme})=>theme.spacings.sm}; border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border}; font-size:${({theme})=>theme.fontSizes.md};`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center; ${({theme})=>theme.media.mobile}{ flex-wrap:wrap; & > * { flex:1; } }`;
const SmallBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;
const Danger = styled(SmallBtn)`
  background:${({theme})=>theme.buttons.danger.background};
  color:${({theme})=>theme.buttons.danger.text};
  &:hover{ background:${({theme})=>theme.buttons.danger.backgroundHover}; }
`;
const Ghost = styled(SmallBtn)`background:transparent; opacity:${({["data-disabled"]:d}:any)=> (d?0.6:1)}; pointer-events:${({["data-disabled"]:d}:any)=> (d?"none":"auto")};`;
const Spacer = styled.div`flex:1;`;
