"use client";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contracts/locales";
import {
  SupportedLocale,
  getLocaleStringFromLang,
  getMultiLang,
} from "@/types/common";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllContractsAdmin } from "@/modules/contracts/slice/contractsSlice";
import type {
  IContract,
  ContractListFilters,
  ContractStatus,
  BillingPeriod,
  DueRule,
} from "@/modules/contracts/types";

type Opt = { id: string; label: string; sub?: string };
const pickLang = (dict?: Record<string,string>, lang?: string) =>
  (dict && (dict[lang||""] || dict.en || dict.tr || Object.values(dict)[0])) || "";

interface Props {
  items: IContract[];
  loading?: boolean;
  onEdit: (c: IContract) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: ContractStatus) => void;
}

export default function ContractList({ items, loading, onEdit, onDelete, onChangeStatus }: Props) {
  const { t, i18n } = useI18nNamespace("contracts", translations);
  const dispatch = useAppDispatch();

  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;
  const locale = getLocaleStringFromLang(lang);
  const df = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);

  /* 🔹 state’ten opsiyonlar */
  const apartments = useAppSelector((s)=> (s as any).apartment?.apartmentAdmin ?? (s as any).apartment?.apartment ?? []) as any[];
  const customers  = useAppSelector((s)=> (s as any).customer?.customerAdmin ?? []) as any[];

  const apartmentOpts: Opt[] = useMemo(()=> (apartments || []).map(a=>({
    id: String(a._id),
    label: pickLang(a.title, String(lang)) || a.slug || String(a._id),
    sub: a.address?.fullText || [a.address?.city, a.address?.country].filter(Boolean).join(", "),
  })), [apartments, lang]);

  const customerOpts: Opt[] = useMemo(()=> (customers || []).map(c=>({
    id: String(c._id),
    label: c.companyName?.trim?.() || c.contactName?.trim?.() || c.email || String(c._id),
    sub: [c.email, c.phone].filter(Boolean).join(" • "),
  })), [customers]);

  /* 🔹 ID → label map’leri */
  const apLabelById = useMemo(() => {
    const m = new Map<string, string>();
    apartmentOpts.forEach(o => m.set(o.id, o.label));
    return m;
  }, [apartmentOpts]);

  const custLabelById = useMemo(() => {
    const m = new Map<string, string>();
    customerOpts.forEach(o => m.set(o.id, o.label));
    return m;
  }, [customerOpts]);

  const [filters, setFilters] = useState<ContractListFilters>({});
  const onChange = (k: keyof ContractListFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v || undefined }));

  const applied = useMemo(() => filters, [filters]);

  const fmtAmount = (amount?: number, currency?: string) => {
    if (amount == null || !currency) return "-";
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const weekdayLabel = (d: number) => t(`weekdays.${d}`, String(d));
  const fmtDue = (dr: DueRule) =>
    dr?.type === "dayOfMonth"
      ? `${t("dueRule.day","Day")} ${dr.day}`
      : `${t("dueRule.nth","Nth")} ${dr.nth} • ${weekdayLabel(dr.weekday)}`;

  /* 🔹 Görüntülenecek etiketler (populate varsa onu, yoksa state map’i) */
  const displayApartment = (c: IContract) => {
    const ap: any = c.parties?.apartment;
    if (!ap) return "-";
    if (typeof ap === "object") {
      return getMultiLang(ap?.title, lang) || ap?.slug || apLabelById.get(String(ap?._id)) || "-";
    }
    return apLabelById.get(String(ap)) || "-";
  };

  const displayCustomer = (c: IContract) => {
    const cu: any = c.parties?.customer;
    if (!cu) return "-";
    if (typeof cu === "object") {
      return cu?.companyName || cu?.contactName || custLabelById.get(String(cu?._id)) || "-";
    }
    return custLabelById.get(String(cu)) || "-";
  };

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("filters._","Filters")}>
        <FilterRow>
          <FieldGroup className="wide">
            <Label htmlFor="f-q">{t("filters.q","Search")}</Label>
            <Input id="f-q" value={filters.q || ""} onChange={(e)=>onChange("q", e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-status">{t("filters.status","Status")}</Label>
            <Select id="f-status" value={filters.status || ""} onChange={(e)=>onChange("status", (e.target.value||undefined) as ContractStatus)}>
              <option value="">{t("filters.status","Status")}</option>
              {["draft","active","suspended","terminated","expired"].map(s=>(
                <option key={s} value={s}>{t(`statuses.${s}`, s)}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-period">{t("filters.period","Period")}</Label>
            <Select id="f-period" value={filters.period || ""} onChange={(e)=>onChange("period", (e.target.value||undefined) as BillingPeriod)}>
              <option value="">{t("filters.period","Period")}</option>
              {["weekly","monthly","quarterly","yearly"].map(p=>(
                <option key={p} value={p}>{t(`period.${p}`, p)}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-active">{t("filters.isActive","Active?")}</Label>
            <Select
              id="f-active"
              value={filters.isActive === undefined ? "" : String(filters.isActive)}
              onChange={(e)=>onChange("isActive", e.target.value===""? undefined : e.target.value==="true")}
            >
              <option value="">{t("filters.isActive","Active?")}</option>
              <option value="true">{t("common.yes","Yes")}</option>
              <option value="false">{t("common.no","No")}</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-apartment">{t("filters.apartment","Apartment")}</Label>
            <Select
              id="f-apartment"
              value={filters.apartment || ""}
              onChange={(e)=>onChange("apartment", e.target.value)}
            >
              <option value="">{t("filters.apartment","Apartment")}</option>
              {apartmentOpts.map(o=>(
                <option key={o.id} value={o.id}>{o.label}{o.sub?` — ${o.sub}`:""}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-customer">{t("filters.customer","Customer")}</Label>
            <Select
              id="f-customer"
              value={filters.customer || ""}
              onChange={(e)=>onChange("customer", e.target.value)}
            >
              <option value="">{t("filters.customer","Customer")}</option>
              {customerOpts.map(o=>(
                <option key={o.id} value={o.id}>{o.label}{o.sub?` — ${o.sub}`:""}</option>
              ))}
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-from">{t("filters.startFrom","Start from")}</Label>
            <Input id="f-from" type="date" value={filters.startFrom || ""} onChange={(e)=>onChange("startFrom", e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-to">{t("filters.startTo","Start to")}</Label>
            <Input id="f-to" type="date" value={filters.startTo || ""} onChange={(e)=>onChange("startTo", e.target.value)} />
          </FieldGroup>
        </FilterRow>

        <Actions>
          <Btn type="button" onClick={()=>dispatch(fetchAllContractsAdmin(applied))} disabled={loading} aria-busy={loading}>
            {t("actions.apply","Apply")}
          </Btn>
          <Btn
            type="button"
            onClick={()=>{ setFilters({}); dispatch(fetchAllContractsAdmin()); }}
            disabled={loading}
          >
            {t("actions.reset","Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Desktop */}
      <Table role="table" aria-label={t("sections.contracts","Contracts")}>
        <thead>
          <tr>
            <th>{t("labels.code","Code")}</th>
            <th>{t("labels.title","Title")}</th>
            <th>{t("labels.apartment","Apartment")}</th>
            <th>{t("labels.customer","Customer")}</th>
            <th>{t("labels.amount","Amount")}</th>
            <th>{t("labels.periodL","Period")}</th>
            <th>{t("labels.dueRule","Due Rule")}</th>
            <th>{t("labels.startDate","Start Date")}</th>
            <th>{t("labels.status","Status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr><td colSpan={10}><Empty>{t("common.empty","Empty")}</Empty></td></tr>
          )}
          {items.map((c)=>(
            <tr key={c._id}>
              <td className="mono">{c.code}</td>
              <td>{getMultiLang(c.title, lang) || "-"}</td>
              {/* ⬇️ isim göster, mono yok */}
              <td>{displayApartment(c)}</td>
              <td>{displayCustomer(c)}</td>
              <td>
                {c.billing.mode === "fixed"
                  ? fmtAmount(c.billing.amount, c.billing.currency)
                  : t("labels.perLine","Per line")}
              </td>
              <td>{t(`period.${c.billing.period}`, c.billing.period)}</td>
              <td>{fmtDue(c.billing.dueRule)}</td>
              <td>{c.billing.startDate ? df.format(new Date(c.billing.startDate)) : "-"}</td>
              <td><Status $s={c.status}>{t(`statuses.${c.status}`, c.status)}</Status></td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={()=>onEdit(c)}>{t("actions.edit","Edit")}</Secondary>
                  {c.status !== "active" && (
                    <Btn type="button" onClick={()=>onChangeStatus(c._id, "active")}>{t("actions.activate","Activate")}</Btn>
                  )}
                  {c.status === "active" && (
                    <Btn type="button" onClick={()=>onChangeStatus(c._id, "suspended")}>{t("actions.suspend","Suspend")}</Btn>
                  )}
                  {c.status !== "terminated" && (
                    <Btn type="button" onClick={()=>onChangeStatus(c._id, "terminated")}>{t("actions.terminate","Terminate")}</Btn>
                  )}
                  <Danger type="button" onClick={()=>onDelete(c._id)}>{t("actions.delete","Delete")}</Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Cards */}
      <CardList>
        {items.length === 0 && !loading && <Empty>{t("common.empty","Empty")}</Empty>}
        {items.map((c)=>(
          <Card key={c._id}>
            <RowLine><Field>{t("labels.code","Code")}</Field><Value className="mono">{c.code}</Value></RowLine>
            <RowLine><Field>{t("labels.title","Title")}</Field><Value>{getMultiLang(c.title, lang) || "-"}</Value></RowLine>
            <RowLine><Field>{t("labels.apartment","Apartment")}</Field><Value>{displayApartment(c)}</Value></RowLine>
            <RowLine><Field>{t("labels.customer","Customer")}</Field><Value>{displayCustomer(c)}</Value></RowLine>
            <RowLine>
              <Field>{t("labels.amount","Amount")}</Field>
              <Value>
                {c.billing.mode === "fixed"
                  ? fmtAmount(c.billing.amount, c.billing.currency)
                  : t("labels.perLine","Per line")}
              </Value>
            </RowLine>
            <RowLine><Field>{t("labels.periodL","Period")}</Field><Value>{t(`period.${c.billing.period}`, c.billing.period)}</Value></RowLine>
            <RowLine><Field>{t("labels.dueRule","Due Rule")}</Field><Value>{fmtDue(c.billing.dueRule)}</Value></RowLine>
            <RowLine><Field>{t("labels.startDate","Start Date")}</Field><Value>{c.billing.startDate ? df.format(new Date(c.billing.startDate)) : "-"}</Value></RowLine>
            <RowLine>
              <Field>{t("labels.status","Status")}</Field>
              <Value><Status $s={c.status}>{t(`statuses.${c.status}`, c.status)}</Status></Value>
            </RowLine>
            <Buttons>
              <Secondary type="button" onClick={()=>onEdit(c)}>{t("actions.edit","Edit")}</Secondary>
              <Danger type="button" onClick={()=>onDelete(c._id)}>{t("actions.delete","Delete")}</Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

const Toolbar = styled.div`
  display:flex;flex-wrap:wrap;align-items:flex-start;gap:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.mobile}{flex-direction:column;align-items:stretch;}
`;

const FieldGroup = styled.div`
  display:flex;flex-direction:column;gap:6px;min-width:0;
  &.wide{ @media (min-width:1024px){grid-column:span 2;} @media (min-width:1440px){grid-column:span 3;} }
`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const FilterRow = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
  align-items:start;min-width:0;flex:1 1 auto;
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};`;

const Input = styled.input`
  min-width:0;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
  &::placeholder{color:${({theme})=>theme.colors.placeholder};}
`;
const Select = styled.select`
  min-width:0;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;

const Btn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.colors.buttonBackground};
  color:${({theme})=>theme.colors.buttonText};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.buttonBorder};
  box-shadow:${({theme})=>theme.shadows.button};
  transition:opacity ${({theme})=>theme.transition.fast};
  &:hover{opacity:${({theme})=>theme.opacity.hover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Secondary = styled(Btn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border-color:${({theme})=>theme.colors.border};
`;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
`;

const Table = styled.table`
  width:100%;border-collapse:collapse;background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};overflow:hidden;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
    text-align:left;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
  ${({theme})=>theme.media.mobile}{display:none;}
`;
const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;

const Status = styled.span<{ $s: ContractStatus }>`
  display:inline-block;padding:.3em .9em;border-radius:${({theme})=>theme.radii.pill};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  background:${({$s,theme})=>
    $s==="active" ? theme.colors.successBg :
    $s==="suspended" ? theme.colors.warningBackground :
    $s==="terminated" ? theme.colors.dangerBg :
    theme.colors.inputBackgroundLight};
  color:${({$s,theme})=>
    $s==="active" ? theme.colors.success :
    $s==="suspended" ? theme.colors.warning :
    $s==="terminated" ? theme.colors.danger :
    theme.colors.textSecondary};
`;

/* Mobile Cards */
const CardList = styled.div`
  display:none; ${({theme})=>theme.media.mobile}{display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};}
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const RowLine = styled.div`display:flex;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};padding:6px 0;`;
const Field = styled.span`color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.xsmall};min-width:110px;`;
const Value = styled.span`
  color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes.xsmall};
  text-align:right;max-width:60%;word-break:break-word;
  &.mono{font-family:${({theme})=>theme.fonts.mono};}
`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:${({theme})=>theme.spacings.xs};margin-top:${({theme})=>theme.spacings.sm};`;
