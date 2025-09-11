"use client";
import styled from "styled-components";
import { useMemo, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/offer/locales";
import type { IOffer, OfferStatus } from "@/modules/offer/types";
import { useAppSelector } from "@/store/hooks";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getMultiLang,
} from "@/types/common";

export type OfferAdminFilters = {
  q?: string;
  status?: OfferStatus;
  company?: string;
  customer?: string;
};

type Props = {
  items: IOffer[];
  loading?: boolean;
  filters: OfferAdminFilters;
  onFilterChange: (next: OfferAdminFilters) => void;
  onEdit: (o: IOffer) => void;
  onDelete?: (o: IOffer) => void;
};

/* -------- helpers -------- */
const toArray = (v: any): any[] => {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    if (Array.isArray((v as any).data)) return (v as any).data;
    if (Array.isArray((v as any).items)) return (v as any).items;
    if (Array.isArray((v as any).list)) return (v as any).list;
    const firstArr = Object.values(v).find((x) => Array.isArray(x)) as any[] | undefined;
    if (firstArr) return firstArr;
  }
  return [];
};

const getId = (obj: any): string =>
  typeof obj?._id === "string"
    ? obj._id
    : (obj?._id?.$oid as string) ||
      (obj?.id as string) ||
      String(obj?.offerNumber || "");

/** Backend ile uyumlu status listesi */
const STATUSES: OfferStatus[] = ["draft", "preparing", "sent", "pending", "approved", "rejected"];

export default function OfferList({
  items,
  loading,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}: Props) {
  const { t, i18n } = useI18nNamespace("offer", translations);

  const pickLocale = (l?: string): SupportedLocale => {
    const two = String(l || "en").slice(0, 2).toLowerCase() as SupportedLocale;
    return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "en";
  };
  const locale = pickLocale(i18n.language);

  // ---- store (fallback'lı) ----
  const rawCompanies = useAppSelector((s) =>
    (s as any)?.company?.companyAdmin ??
    (s as any)?.companies?.admin ??
    (s as any)?.company?.items ??
    []
  );
  const rawCustomers = useAppSelector((s) =>
    (s as any)?.customer?.customerAdmin ??
    (s as any)?.customers?.admin ??
    (s as any)?.customer?.items ??
    []
  );

  const companies = toArray(rawCompanies);
  const customers = toArray(rawCustomers);

  const ml = useCallback((v: any): string => {
    if (v == null) return "—";
    if (typeof v === "string") return v;
    return getMultiLang(v as Record<string, string>, locale) || "—";
  }, [locale]);

  const getName = useCallback((v: any): string => {
    if (!v) return "—";
    if (typeof v === "string") return v;
    const cand = (v as any).companyName ?? (v as any).contactName ?? (v as any).name;
    return ml(cand);
  }, [ml]);

  const fmtMoney = (n: number, currency?: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "EUR" })
        .format(Number(n) || 0);
    } catch {
      return `${(Number(n) || 0).toFixed(2)} ${currency || ""}`.trim();
    }
  };
  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");

  const onChange = (patch: Partial<OfferAdminFilters>) =>
    onFilterChange({ ...filters, ...patch });

  const hasDelete = typeof onDelete === "function";
  const confirmDelete = (o: IOffer) => {
    if (!hasDelete) return;
    const ok = window.confirm(t("list.confirmDelete", "Delete this offer?"));
    if (ok) onDelete!(o);
  };

  const sortByName = useCallback((a: any, b: any) => {
    return getName(a).localeCompare(getName(b));
  }, [getName]);

  const companyOptions = useMemo(() => companies.slice().sort(sortByName), [companies, sortByName]);
  const customerOptions = useMemo(() => customers.slice().sort(sortByName), [customers, sortByName]);

  return (
    <Card>
      <Toolbar>
        <Input
          placeholder={t("list.search", "Search offers…")}
          value={filters.q || ""}
          onChange={(e) => onChange({ q: e.target.value })}
        />
        <Select
          value={filters.status || ""}
          onChange={(e) => onChange({ status: (e.target.value || undefined) as OfferStatus | undefined })}
        >
          <option value="">{t("list.allStatuses", "All statuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`, s)}
            </option>
          ))}
        </Select>
        <Select
          value={filters.company || ""}
          onChange={(e) => onChange({ company: e.target.value || undefined })}
        >
          <option value="">{t("list.allCompanies", "All companies")}</option>
          {companyOptions.map((c: any) => (
            <option key={getId(c) || String(getName(c))} value={getId(c)} title={getName(c)}>
              {getName(c)}
            </option>
          ))}
        </Select>
        <Select
          value={filters.customer || ""}
          onChange={(e) => onChange({ customer: e.target.value || undefined })}
        >
          <option value="">{t("list.allCustomers", "All customers")}</option>
          {customerOptions.map((c: any) => (
            <option key={getId(c) || String(getName(c))} value={getId(c)} title={getName(c)}>
              {getName(c)}
            </option>
          ))}
        </Select>
      </Toolbar>

      {/* Desktop */}
      <DesktopOnly role="region" aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("list.offerNumber", "Offer #")}</th>
              <th>{t("list.customer", "Customer")}</th>
              <th>{t("list.company", "Company")}</th>
              <th>{t("list.total", "Total")}</th>
              <th>{t("list.status", "Status")}</th>
              <th>{t("list.validUntil", "Valid until")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!items.length && (
              <tr>
                <td colSpan={7}>
                  <Empty>
                    {loading ? t("common.loading", "Loading…") : t("list.empty", "No offers found.")}
                  </Empty>
                </td>
              </tr>
            )}
            {items.map((o) => (
              <tr key={getId(o)}>
                <td><Mono>{o.offerNumber}</Mono></td>
                <td>{getName(o.customer)}</td>
                <td>{getName(o.company)}</td>
                <td>{fmtMoney(o.totalGross, o.currency)}</td>
                <td>
                  <StatusBadge data-status={String(o.status).toLowerCase()}>
                    {t(`status.${o.status}`, o.status)}
                  </StatusBadge>
                </td>
                <td>{fmtDate(o.validUntil)}</td>
                <td>
                  <RowActions>
                    <SmallBtn onClick={() => onEdit(o)}>{t("common.edit", "Edit")}</SmallBtn>
                    {hasDelete && (
                      <DangerBtn title={t("common.delete", "Delete")} onClick={() => confirmDelete(o)}>
                        {t("common.delete", "Delete")}
                      </DangerBtn>
                    )}
                  </RowActions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </DesktopOnly>

      {/* Mobile & Tablet */}
      <MobileTabletOnly aria-busy={!!loading}>
        {!items.length ? (
          <EmptyWrap>
            <Empty>{loading ? t("common.loading", "Loading…") : t("list.empty", "No offers found.")}</Empty>
          </EmptyWrap>
        ) : (
          <CardGrid>
            {items.map((o) => (
              <OfferCard key={getId(o)}>
                <CardHead>
                  <Mono>{o.offerNumber}</Mono>
                  <StatusBadge data-status={String(o.status).toLowerCase()}>
                    {t(`status.${o.status}`, o.status)}
                  </StatusBadge>
                </CardHead>
                <CardRows>
                  <RowLine>
                    <RowLabel>{t("list.customer", "Customer")}</RowLabel>
                    <RowValue>{getName(o.customer)}</RowValue>
                  </RowLine>
                  <RowLine>
                    <RowLabel>{t("list.company", "Company")}</RowLabel>
                    <RowValue>{getName(o.company)}</RowValue>
                  </RowLine>
                  <RowLine>
                    <RowLabel>{t("list.validUntil", "Valid until")}</RowLabel>
                    <RowValue>{fmtDate(o.validUntil)}</RowValue>
                  </RowLine>
                  <RowLine>
                    <RowLabel>{t("list.total", "Total")}</RowLabel>
                    <RowValue><strong>{fmtMoney(o.totalGross, o.currency)}</strong></RowValue>
                  </RowLine>
                </CardRows>
                <CardActions>
                  <SmallBtn onClick={() => onEdit(o)}>{t("common.edit", "Edit")}</SmallBtn>
                  {hasDelete && (
                    <DangerBtn onClick={() => confirmDelete(o)}>{t("common.delete", "Delete")}</DangerBtn>
                  )}
                </CardActions>
              </OfferCard>
            ))}
          </CardGrid>
        )}
      </MobileTabletOnly>
    </Card>
  );
}

/* ============ styled ============ */
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
`;
const Toolbar = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; padding:${({theme})=>theme.spacings.md};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  ${({theme})=>theme.media.mobile}{ flex-wrap:wrap; }
`;
const Input = styled.input`
  flex:1; min-width:180px; padding:10px 12px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.colors.inputBackground};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; }
`;
const Select = styled.select`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.colors.inputBackground};
`;

/* Desktop table only on >= 1025px */
const DesktopOnly = styled.div`
  display:block; overflow:auto;
  ${({theme})=>theme.media.mobile}{ display:none; }
  ${({theme})=>theme.media.tablet}{ display:none; }
`;
const Table = styled.table`
  width:100%; border-collapse:separate; border-spacing:0;
  th, td{ padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md}; text-align:left; }
  thead th{ background:${({theme})=>theme.colors.tableHeader}; position:sticky; top:0; z-index:1; }
  tbody tr:nth-child(even){ background:${({theme})=>theme.colors.backgroundAlt}; }
`;

const MobileTabletOnly = styled.div`
  display:none;
  ${({theme})=>theme.media.mobile}{ display:block; }
  ${({theme})=>theme.media.tablet}{ display:block; }
`;

const CardGrid = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns: 1fr;
`;
const OfferCard = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const CardHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.sm};
`;
const CardRows = styled.div`display:flex; flex-direction:column; gap:6px;`;
const RowLine = styled.div`display:flex; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};`;
const RowLabel = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const RowValue = styled.span`text-align:right;`;
const CardActions = styled.div`
  display:flex; justify-content:flex-end; gap:${({theme})=>theme.spacings.xs};
  margin-top:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.mobile}{ flex-wrap:wrap; & > * { flex:1; } }
`;

const Mono = styled.code`font-family:${({theme})=>theme.fonts.mono}; font-size:${({theme})=>theme.fontSizes.xsmall};`;

/* Tüm statüler için rozet renkleri */
const StatusBadge = styled.span`
  padding:2px 8px; border-radius:${({theme})=>theme.radii.pill}; font-size:${({theme})=>theme.fontSizes.xsmall};
  background:${({theme})=>theme.colors.tagBackground};
  color:${({theme})=>theme.colors.textSecondary};

  &[data-status="draft"]{
    background:${({theme})=>theme.colors.inputBackgroundLight};
    color:${({theme})=>theme.colors.textSecondary};
  }
  &[data-status="ready"]{
    background:${({theme})=>theme.colors.info};
    color:${({theme})=>theme.colors.info};
  }
  &[data-status="pending"]{
    background:${({theme})=>theme.colors.warning};
    color:${({theme})=>theme.colors.warning};
  }
  &[data-status="sent"]{
    background:${({theme})=>theme.colors.info};
    color:${({theme})=>theme.colors.info};
  }
  &[data-status="approved"]{
    background:${({theme})=>theme.colors.successBg};
    color:${({theme})=>theme.colors.success};
  }
  &[data-status="rejected"]{
    background:${({theme})=>theme.colors.dangerBg};
    color:${({theme})=>theme.colors.danger};
  }
`;

const RowActions = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; justify-content:flex-end;`;

const SmallBtn = styled.button`
  padding:6px 10px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const DangerBtn = styled(SmallBtn)`
  background:${({theme})=>theme.buttons.danger.background};
  color:${({theme})=>theme.buttons.danger.text};
  border-color:${({theme})=>theme.buttons.danger.backgroundHover};
  &:hover{ background:${({theme})=>theme.buttons.danger.backgroundHover}; }
`;

const EmptyWrap = styled.div`padding:${({theme})=>theme.spacings.md};`;
const Empty = styled.div`color:${({theme})=>theme.colors.textSecondary};`;
