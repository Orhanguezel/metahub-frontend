"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/expenses";
import { useAppDispatch } from "@/store/hooks";
import { fetchAllExpensesAdmin } from "@/modules/expenses/slice/expensesSlice";
import type {
  IExpense, ExpenseListFilters, ExpenseStatus, ExpenseType, ReimbStatus,
} from "@/modules/expenses/types";

interface Props {
  items: IExpense[];
  loading?: boolean;
  onEdit: (e: IExpense) => void;
  onDelete: (id: string) => void;
}

const TYPES: ExpenseType[] = ["vendor_bill","purchase","reimbursement","subscription","utility","other"];
const STATUSES: ExpenseStatus[] = ["draft","submitted","approved","scheduled","partially_paid","paid","rejected","void"];
const REIMB: ReimbStatus[] = ["not_required","pending","submitted","approved","paid"];

export default function ExpenseList({ items, loading, onEdit, onDelete }: Props) {
  const { t, i18n } = useI18nNamespace("expenses", translations);
  const dispatch = useAppDispatch();

  const locale = (i18n.language || "en").replace("_", "-");
  const nf = useMemo(() => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const df = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);

  const [filters, setFilters] = useState<ExpenseListFilters>({});
  const onChange = (k: keyof ExpenseListFilters, v: any) => setFilters((s) => ({ ...s, [k]: v || undefined }));
  const applied = useMemo(() => filters, [filters]);
  const hid = (k: string) => `filters_${k}`;

  return (
    <Wrap>
      <Toolbar as="fieldset">
        <Legend>{t("legend_filters","Filters")}</Legend>

        <FilterRow role="group" aria-label={t("filters","Filters")}>
          {/* Search – wide on tablet/desktop */}
          <FieldWide>
            <Input
              placeholder={t("q","Search")}
              value={filters.q || ""}
              onChange={(e)=>onChange("q", e.target.value)}
              aria-label={t("q","Search")}
            />
          </FieldWide>

          <Field>
            <Label htmlFor="f_type">{t("type","Type")}</Label>
            <Select id="f_type" value={filters.type || ""} onChange={(e)=>onChange("type",(e.target.value||undefined) as ExpenseType)}>
              <option value="">{t("type","Type")}</option>
              {TYPES.map(x=> <option key={x} value={x}>{t(`type_${x}`, x)}</option>)}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="f_status">{t("status","Status")}</Label>
            <Select id="f_status" value={filters.status || ""} onChange={(e)=>onChange("status",(e.target.value||undefined) as ExpenseStatus)}>
              <option value="">{t("status","Status")}</option>
              {STATUSES.map(s=> <option key={s} value={s}>{t(`status_${s}`, s)}</option>)}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="f_vendor">{t("vendorRef","Vendor Id")}</Label>
            <Input id="f_vendor" value={filters.vendorRef || ""} onChange={(e)=>onChange("vendorRef", e.target.value)} />
          </Field>

          <Field>
            <Label htmlFor="f_employee">{t("employeeRef","Employee Id")}</Label>
            <Input id="f_employee" value={filters.employeeRef || ""} onChange={(e)=>onChange("employeeRef", e.target.value)} />
          </Field>

          {/* Dates – wide on tablet/desktop */}
          <FieldWide>
            <Label htmlFor={hid("dateFrom")}>{t("dateFrom","Date From")}</Label>
            <Input
              id={hid("dateFrom")}
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e)=>onChange("dateFrom", e.target.value)}
              aria-describedby={hid("dateFrom_help")}
            />
            <Hint id={hid("dateFrom_help")}>{t("help.dateFrom","Start date (YYYY-MM-DD).")}</Hint>
          </FieldWide>

          <FieldWide>
            <Label htmlFor={hid("dateTo")}>{t("dateTo","Date To")}</Label>
            <Input
              id={hid("dateTo")}
              type="date"
              value={filters.dateTo || ""}
              onChange={(e)=>onChange("dateTo", e.target.value)}
              aria-describedby={hid("dateTo_help")}
            />
            <Hint id={hid("dateTo_help")}>{t("help.dateTo","End date (YYYY-MM-DD).")}</Hint>
          </FieldWide>

          <Field>
            <Label htmlFor="f_reimb">{t("reimbursable","Reimbursable?")}</Label>
            <Select
              id="f_reimb"
              value={filters.reimbursable === undefined ? "" : String(filters.reimbursable)}
              onChange={(e)=>onChange("reimbursable", e.target.value===""? undefined : e.target.value==="true")}
            >
              <option value="">{t("reimbursable","Reimb?")}</option>
              <option value="true">{t("yes","Yes")}</option>
              <option value="false">{t("no","No")}</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="f_reimbst">{t("reimbStatus","Reimb Status")}</Label>
            <Select
              id="f_reimbst"
              value={filters.reimbursementStatus || ""}
              onChange={(e)=>onChange("reimbursementStatus",(e.target.value||undefined) as ReimbStatus)}
            >
              <option value="">{t("reimbStatus","Reimb Status")}</option>
              {REIMB.map(r=> <option key={r} value={r}>{t(`reimb_${r}`, r)}</option>)}
            </Select>
          </Field>
        </FilterRow>

        <Actions>
          <Btn type="button" onClick={()=>dispatch(fetchAllExpensesAdmin(applied))} disabled={loading} aria-busy={loading}>
            {t("apply","Apply")}
          </Btn>
          <Btn type="button" onClick={()=>{ setFilters({}); dispatch(fetchAllExpensesAdmin()); }} disabled={loading}>
            {t("reset","Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      <Table role="table" aria-label={t("list","Expenses")}>
        <thead>
          <tr>
            <th>{t("code","Code")}</th>
            <th>{t("expenseDate","Date")}</th>
            <th>{t("type","Type")}</th>
            <th>{t("vendorBillNo","Vendor Bill")}</th>
            <th>{t("currency","Curr")}</th>
            <th>{t("grandTotal","Total")}</th>
            <th>{t("status","Status")}</th>
            <th>{t("reimbursable","Reimb")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!loading && items.length===0 && (
            <tr><td colSpan={9}><Empty>∅</Empty></td></tr>
          )}
          {items.map(e=>(
            <tr key={e._id}>
              <td className="mono">{e.code}</td>
              <td>{e.expenseDate ? df.format(new Date(e.expenseDate)) : "-"}</td>
              <td>{t(`type_${e.type}`, e.type)}</td>
              <td className="mono">{e.vendorBillNo || "-"}</td>
              <td>{e.currency}</td>
              <td className="mono">{nf.format(e.grandTotal ?? 0)}</td>
              <td><Status $s={e.status}>{t(`status_${e.status}`, e.status)}</Status></td>
              <td>{e.reimbursable ? t("yes","Yes") : t("no","No")}</td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={()=>onEdit(e)}>{t("edit","Edit")}</Secondary>
                  <Danger type="button" onClick={()=>onDelete(e._id)}>{t("delete","Delete")}</Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Cards */}
      <CardList>
        {items.length===0 && !loading && <Empty>∅</Empty>}
        {items.map(e=>(
          <Card key={e._id}>
            <Line><FieldLabel>{t("code","Code")}</FieldLabel><Value className="mono">{e.code}</Value></Line>
            <Line><FieldLabel>{t("expenseDate","Date")}</FieldLabel><Value>{e.expenseDate ? df.format(new Date(e.expenseDate)) : "-"}</Value></Line>
            <Line><FieldLabel>{t("type","Type")}</FieldLabel><Value>{t(`type_${e.type}`, e.type)}</Value></Line>
            <Line><FieldLabel>{t("grandTotal","Total")}</FieldLabel><Value className="mono">{nf.format(e.grandTotal ?? 0)} {e.currency}</Value></Line>
            <Line><FieldLabel>{t("status","Status")}</FieldLabel><Value><Status $s={e.status}>{t(`status_${e.status}`, e.status)}</Status></Value></Line>
            <Buttons>
              <Secondary type="button" onClick={()=>onEdit(e)}>{t("edit","Edit")}</Secondary>
              <Danger type="button" onClick={()=>onDelete(e._id)}>{t("delete","Delete")}</Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

/* Fieldset container */
const Toolbar = styled.fieldset`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const Legend = styled.legend`
  padding:0 ${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textPrimary};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
`;

/* KEY CHANGE: fluid grid that works on tablet too */
const FilterRow = styled.div`
  display:grid;
  gap:${({theme})=>theme.spacings.sm};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  ${({theme})=>theme.media.tablet}{ grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  ${({theme})=>theme.media.mobile}{ grid-template-columns: 1fr; }
  align-items:start;
`;

/* let some fields span 2 cols on tablet/desktop (search & dates) */
const Field = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const FieldWide = styled(Field)`
  grid-column: span 1;
  ${({theme})=>theme.media.tablet}{ grid-column: span 2; }
  ${({theme})=>theme.media.desktop}{ grid-column: span 2; }
`;

const Actions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.sm};
  justify-content:flex-end;flex-wrap:wrap;
`;

const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Hint = styled.div`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};opacity:.8;`;

const Input = styled.input`
  min-width:0;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  min-width:0;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;

const Btn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.colors.buttonBackground};
  color:${({theme})=>theme.colors.buttonText};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.buttonBorder};
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

/* table remains visible on tablet; only hidden on phones */
const Table = styled.table`
  width:100%;border-collapse:collapse;
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;

  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
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

const Status = styled.span<{ $s: ExpenseStatus }>`
  display:inline-block;padding:.3em .9em;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  background:${({$s,theme})=>
    $s==="paid" ? theme.colors.successBg :
    $s==="approved" || $s==="submitted" ? theme.colors.info :
    $s==="rejected" || $s==="void" ? theme.colors.dangerBg :
    $s==="partially_paid" ? theme.colors.warningBackground :
    theme.colors.inputBackgroundLight};
  color:${({$s,theme})=>
    $s==="paid" ? theme.colors.success :
    $s==="approved" || $s==="submitted" ? theme.colors.info :
    $s==="rejected" || $s==="void" ? theme.colors.danger :
    $s==="partially_paid" ? theme.colors.warning :
    theme.colors.textSecondary};
`;

/* Mobile cards */
const CardList = styled.div`display:none; ${({theme})=>theme.media.mobile}{display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};}`;
const Card = styled.div`background:${({theme})=>theme.colors.cardBackground};border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};padding:${({theme})=>theme.spacings.md};`;
const Line = styled.div`display:flex;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};padding:6px 0;`;
const FieldLabel = styled.span`color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.xsmall};min-width:110px;`;
const Value = styled.span`color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes.xsmall};text-align:right;max-width:60%;word-break:break-word;&.mono{font-family:${({theme})=>theme.fonts.mono};}`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:${({theme})=>theme.spacings.xs};margin-top:${({theme})=>theme.spacings.sm};`;
