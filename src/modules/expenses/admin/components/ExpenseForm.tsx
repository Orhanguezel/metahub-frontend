"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/expenses";
import { useAppDispatch } from "@/store/hooks";
import { createExpense, updateExpense } from "@/modules/expenses/slice/expensesSlice";
import type {
  IExpense, IExpenseLine, ExpenseType, ExpenseStatus, ReimbStatus,
} from "@/modules/expenses/types";

/* ---- helpers ---- */
function calcLine(l: IExpenseLine) {
  const qty = Number(l.qty ?? 1);
  const unit = Number(l.unitPrice ?? 0);
  const disc = Number(l.discount ?? 0);
  const rate = Number(l.taxRate ?? 0);
  const net = Math.max(0, +(qty * unit - disc).toFixed(2));
  const tax = Math.max(0, +(net * (rate / 100)).toFixed(2));
  const total = +(net + tax).toFixed(2);
  return { net, tax, total };
}
function summarize(lines: IExpenseLine[]) {
  let sub = 0, tax = 0;
  for (const ln of lines) {
    const { net, tax: t } = calcLine(ln);
    sub += net; tax += t;
  }
  const grand = +(sub + tax).toFixed(2);
  return { subTotal: +sub.toFixed(2), taxTotal: +tax.toFixed(2), grandTotal: grand };
}

const TYPES: ExpenseType[] = ["vendor_bill","purchase","reimbursement","subscription","utility","other"];
const STATUSES: ExpenseStatus[] = ["draft","submitted","approved","scheduled","partially_paid","paid","rejected","void"];
const REIMB: ReimbStatus[] = ["not_required","pending","submitted","approved","paid"];

interface Props { initial?: IExpense; onClose: () => void; onSaved?: () => void; }

export default function ExpenseForm({ initial, onClose, onSaved }: Props) {
  const { t } = useI18nNamespace("expenses", translations);
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);

  /* ---------- header ---------- */
  const [type, setType] = useState<ExpenseType>(initial?.type || "purchase");
  const [expenseDate, setExpenseDate] = useState<string>(initial?.expenseDate ? new Date(initial.expenseDate).toISOString().slice(0,10) : "");
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : "");
  const [currency, setCurrency] = useState<string>(initial?.currency || "EUR");
  const [fxRate, setFxRate] = useState<number>(Number(initial?.fxRate ?? 0));
  const [status, setStatus] = useState<ExpenseStatus>(initial?.status || "draft");

  const [vendorRef, setVendorRef] = useState<string>(String(initial?.vendorRef || ""));
  const [employeeRef, setEmployeeRef] = useState<string>(String(initial?.employeeRef || ""));
  const [apartmentRef, setApartmentRef] = useState<string>(String(initial?.apartmentRef || ""));
  const [jobRef, setJobRef] = useState<string>(String(initial?.jobRef || ""));
  const [vendorBillNo, setVendorBillNo] = useState(initial?.vendorBillNo || "");

  const [reimbursable, setReimbursable] = useState<boolean>(!!initial?.reimbursable);
  const [reimbStatus, setReimbStatus] = useState<ReimbStatus>(initial?.reimbursementStatus || "not_required");

  const [notes, setNotes] = useState(initial?.notes || "");
  const [internalNote, setInternalNote] = useState(initial?.internalNote || "");

  /* ---------- lines ---------- */
  const [lines, setLines] = useState<IExpenseLine[]>(
    initial?.lines?.length ? initial.lines : [{ qty: 1, unitPrice: 0, discount: 0, taxRate: 0 }]
  );
  const upsertLine = (i: number, patch: Partial<IExpenseLine>) =>
    setLines(arr => arr.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));
  const addLine = () => setLines(arr => [...arr, { qty: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
  const removeLine = (i: number) => setLines(arr => arr.filter((_, idx) => idx !== i));

  const totals = useMemo(() => summarize(lines), [lines]);

  /* ---------- submit ---------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IExpense> = {
      type,
      expenseDate: expenseDate || new Date().toISOString(),
      dueDate: dueDate || undefined,
      currency,
      fxRate: Number(fxRate) || undefined,
      status,
      vendorRef: vendorRef || undefined,
      employeeRef: employeeRef || undefined,
      apartmentRef: apartmentRef || undefined,
      jobRef: jobRef || undefined,
      vendorBillNo: vendorBillNo || undefined,
      reimbursable,
      reimbursementStatus: reimbStatus,
      lines: lines.map(l => ({ ...l })), // BE hesaplıyor
      notes: notes || undefined,
      internalNote: internalNote || undefined,
    };

    if (isEdit && initial) {
      await dispatch(updateExpense({ id: initial._id, changes: payload })).unwrap().catch(()=>{});
    } else {
      await dispatch(createExpense(payload)).unwrap().catch(()=>{});
    }
    onSaved?.();
  };

  /* id -> help bağlamak için küçük yardımcı */
  const helpId = (id: string) => `${id}_help`;

  return (
    <Form onSubmit={onSubmit} aria-label={t("form", "Expense Form")}>
      {/* Header */}
      <Fieldset>
        <Legend>{t("legend_header", "Details")}</Legend>
        <Row>
          <Col>
            <Label htmlFor="type">{t("type","Type")}</Label>
            <Select id="type" value={type} aria-describedby={helpId("type")}
              onChange={(e)=>setType(e.target.value as ExpenseType)}>
              {TYPES.map(x=>(
                <option key={x} value={x}>{t(`type_${x}`, x)}</option>
              ))}
            </Select>
            <Hint id={helpId("type")}>{t("help.type","Select the expense type.")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="expenseDate">{t("expenseDate","Expense Date")}</Label>
            <Input id="expenseDate" type="date" required value={expenseDate}
              aria-describedby={helpId("expenseDate")}
              onChange={(e)=>setExpenseDate(e.target.value)}/>
            <Hint id={helpId("expenseDate")}>{t("help.expenseDate","Document/receipt date.")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="dueDate">{t("dueDate","Due Date")}</Label>
            <Input id="dueDate" type="date" value={dueDate}
              aria-describedby={helpId("dueDate")}
              onChange={(e)=>setDueDate(e.target.value)}/>
            <Hint id={helpId("dueDate")}>{t("help.dueDate","Payment due date (optional).")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="status">{t("status","Status")}</Label>
            <Select id="status" value={status} aria-describedby={helpId("status")}
              onChange={(e)=>setStatus(e.target.value as ExpenseStatus)}>
              {STATUSES.map(s=>(
                <option key={s} value={s}>{t(`status_${s}`, s)}</option>
              ))}
            </Select>
            <Hint id={helpId("status")}>{t("help.status","Workflow status of the expense.")}</Hint>
          </Col>
        </Row>

        <Row>
          <Col>
            <Label htmlFor="currency">{t("currency","Currency")}</Label>
            <Input id="currency" value={currency} placeholder={t("ph_currency","e.g. EUR")}
              aria-describedby={helpId("currency")}
              onChange={(e)=>setCurrency(e.target.value)}/>
            <Hint id={helpId("currency")}>{t("help.currency","ISO code like EUR, USD, TRY.")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="fxRate">{t("fxRate","FX Rate")}</Label>
            <Input id="fxRate" type="number" inputMode="decimal" step="0.0001"
              value={Number.isFinite(fxRate)?fxRate:0}
              aria-describedby={helpId("fxRate")}
              onChange={(e)=>setFxRate(Number(e.target.value))}/>
            <Hint id={helpId("fxRate")}>{t("help.fxRate","1 currency = fxRate × baseCurrency (optional).")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="vendorRef">{t("vendorRef","Vendor Id")}</Label>
            <Input id="vendorRef" value={vendorRef} placeholder={t("ph_vendorId","ObjectId")}
              aria-describedby={helpId("vendorRef")}
              onChange={(e)=>setVendorRef(e.target.value)}/>
            <Hint id={helpId("vendorRef")}>{t("help.vendorRef","Link to vendor (contact) if any.")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="employeeRef">{t("employeeRef","Employee Id")}</Label>
            <Input id="employeeRef" value={employeeRef} placeholder={t("ph_employeeId","ObjectId")}
              aria-describedby={helpId("employeeRef")}
              onChange={(e)=>setEmployeeRef(e.target.value)}/>
            <Hint id={helpId("employeeRef")}>{t("help.employeeRef","Employee for reimbursements (optional).")}</Hint>
          </Col>
        </Row>

        <Row>
          <Col>
            <Label htmlFor="apartmentRef">{t("apartmentRef","Apartment Id")}</Label>
            <Input id="apartmentRef" value={apartmentRef} placeholder={t("ph_apartmentId","ObjectId")}
              aria-describedby={helpId("apartmentRef")}
              onChange={(e)=>setApartmentRef(e.target.value)}/>
            <Hint id={helpId("apartmentRef")}>{t("help.apartmentRef","For quick reporting (optional).")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="jobRef">{t("jobRef","Job Id")}</Label>
            <Input id="jobRef" value={jobRef} placeholder={t("ph_jobId","ObjectId")}
              aria-describedby={helpId("jobRef")}
              onChange={(e)=>setJobRef(e.target.value)}/>
            <Hint id={helpId("jobRef")}>{t("help.jobRef","Related operations job (optional).")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="vendorBillNo">{t("vendorBillNo","Vendor Bill No")}</Label>
            <Input id="vendorBillNo" value={vendorBillNo} placeholder={t("ph_billNo","e.g. INV-123")}
              aria-describedby={helpId("vendorBillNo")}
              onChange={(e)=>setVendorBillNo(e.target.value)}/>
            <Hint id={helpId("vendorBillNo")}>{t("help.vendorBillNo","Supplier invoice/bill number.")}</Hint>
          </Col>

          <Col>
            <Label htmlFor="reimbursable">{t("reimbursable","Reimbursable?")}</Label>
            <CheckRow htmlFor="reimbursable" aria-describedby={helpId("reimbursable")}>
              <input id="reimbursable" type="checkbox" checked={reimbursable}
                onChange={(e)=>setReimbursable(e.target.checked)} />
              <Select aria-label={t("reimbStatus","Reimb Status")} value={reimbStatus}
                onChange={(e)=>setReimbStatus(e.target.value as ReimbStatus)}>
                {REIMB.map(r=>(
                  <option key={r} value={r}>{t(`reimb_${r}`, r)}</option>
                ))}
              </Select>
            </CheckRow>
            <Hint id={helpId("reimbursable")}>{t("help.reimbursable","Mark if cost will be reimbursed to employee.")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      {/* Lines */}
      <Fieldset>
        <Legend>{t("legend_lines","Lines")}</Legend>
        {lines.map((l, idx)=>(
          <LineRow key={idx}>
            <Col>
              <Label htmlFor={`cat_${idx}`}>{t("categoryName","Category")}</Label>
              <Input id={`cat_${idx}`} value={l.categoryName || ""} placeholder={t("ph_category","e.g. Supplies")}
                aria-describedby={helpId(`cat_${idx}`)}
                onChange={(e)=>upsertLine(idx,{ categoryName: e.target.value || undefined })}/>
              <Hint id={helpId(`cat_${idx}`)}>{t("help.categoryName","Line category name (snapshot).")}</Hint>
            </Col>

            <Col>
              <Label htmlFor={`desc_${idx}`}>{t("description","Description")}</Label>
              <Input id={`desc_${idx}`} value={l.description || ""} placeholder={t("ph_description","Optional")}
                aria-describedby={helpId(`desc_${idx}`)}
                onChange={(e)=>upsertLine(idx,{ description: e.target.value || undefined })}/>
              <Hint id={helpId(`desc_${idx}`)}>{t("help.description","Free text description (optional).")}</Hint>
            </Col>

            <SmallCols>
              <Col>
                <Label htmlFor={`qty_${idx}`}>{t("qty","Qty")}</Label>
                <Input id={`qty_${idx}`} type="number" min={0} step="0.01" value={l.qty ?? 1}
                  aria-describedby={helpId(`qty_${idx}`)}
                  onChange={(e)=>upsertLine(idx,{ qty: Number(e.target.value) || 0 })}/>
                <Hint id={helpId(`qty_${idx}`)}>{t("help.qty","Quantity (default 1).")}</Hint>
              </Col>

              <Col>
                <Label htmlFor={`unit_${idx}`}>{t("unitPrice","Unit Price")}</Label>
                <Input id={`unit_${idx}`} type="number" min={0} step="0.01" value={l.unitPrice ?? 0}
                  aria-describedby={helpId(`unit_${idx}`)}
                  onChange={(e)=>upsertLine(idx,{ unitPrice: Number(e.target.value) || 0 })}/>
                <Hint id={helpId(`unit_${idx}`)}>{t("help.unitPrice","Price per unit in document currency.")}</Hint>
              </Col>

              <Col>
                <Label htmlFor={`disc_${idx}`}>{t("discount","Discount")}</Label>
                <Input id={`disc_${idx}`} type="number" min={0} step="0.01" value={l.discount ?? 0}
                  aria-describedby={helpId(`disc_${idx}`)}
                  onChange={(e)=>upsertLine(idx,{ discount: Number(e.target.value) || 0 })}/>
                <Hint id={helpId(`disc_${idx}`)}>{t("help.discount","Line discount amount (absolute).")}</Hint>
              </Col>

              <Col>
                <Label htmlFor={`tax_${idx}`}>{t("taxRate","Tax %")}</Label>
                <Input id={`tax_${idx}`} type="number" min={0} max={100} step="0.01" value={l.taxRate ?? 0}
                  aria-describedby={helpId(`tax_${idx}`)}
                  onChange={(e)=>upsertLine(idx,{ taxRate: Number(e.target.value) || 0 })}/>
                <Hint id={helpId(`tax_${idx}`)}>{t("help.taxRate","VAT/Tax rate percentage.")}</Hint>
              </Col>
            </SmallCols>

            <Totals aria-live="polite">
              {(() => {
                const c = calcLine(l);
                return <span>{t("lineTotal","Total")}: <b>{c.total.toFixed(2)}</b> ({t("net","Net")}: {c.net.toFixed(2)} / {t("tax","Tax")}: {c.tax.toFixed(2)})</span>;
              })()}
            </Totals>

            <BtnRow>
              <Small type="button" onClick={(ev)=>{ev.preventDefault(); addLine();}}>{t("add","Add")}</Small>
              {lines.length>1 && (
                <Small type="button" onClick={(ev)=>{ev.preventDefault(); removeLine(idx);}}>
                  {t("remove","Remove")}
                </Small>
              )}
            </BtnRow>
          </LineRow>
        ))}
      </Fieldset>

      {/* Totals */}
      <Fieldset>
        <Legend>{t("legend_totals","Totals")}</Legend>
        <Summary role="status" aria-live="polite">
          <span>{t("subTotal","Sub Total")}: <b>{totals.subTotal.toFixed(2)} {currency}</b></span>
          <span>{t("taxTotal","Tax Total")}: <b>{totals.taxTotal.toFixed(2)} {currency}</b></span>
          <span>{t("grandTotal","Grand Total")}: <b>{totals.grandTotal.toFixed(2)} {currency}</b></span>
        </Summary>
      </Fieldset>

      {/* Notes */}
      <Fieldset>
        <Legend>{t("legend_notes","Notes")}</Legend>
        <Row>
          <Col>
            <Label htmlFor="notes">{t("notes","Notes")}</Label>
            <TextArea id="notes" rows={2} value={notes}
              aria-describedby={helpId("notes")}
              onChange={(e)=>setNotes(e.target.value)} />
            <Hint id={helpId("notes")}>{t("help.notes","Visible notes for this expense.")}</Hint>
          </Col>
          <Col>
            <Label htmlFor="internalNote">{t("internalNote","Internal Note")}</Label>
            <TextArea id="internalNote" rows={2} value={internalNote}
              aria-describedby={helpId("internalNote")}
              onChange={(e)=>setInternalNote(e.target.value)} />
            <Hint id={helpId("internalNote")}>{t("help.internalNote","Private/internal note.")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update","Update") : t("create","Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.lg};`;
const Fieldset = styled.fieldset`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.lg};
`;
const Legend = styled.legend`
  padding:0 ${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textPrimary};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const LineRow = styled.div`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};
  padding:${({theme})=>theme.spacings.sm} 0;
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const SmallCols = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.xs};grid-template-columns:repeat(4,1fr);
  ${({theme})=>theme.media.mobile}{grid-template-columns:repeat(2,1fr);}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Hint = styled.div`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  opacity:.8;
`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};}
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const BtnRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:flex-end;`;
const Small = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const Totals = styled.div`
  font-weight:${({theme})=>theme.fontWeights.medium};
  color:${({theme})=>theme.colors.textPrimary};
  margin-top:${({theme})=>theme.spacings.sm};
  text-align:right;
`;
const Summary = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.lg};flex-wrap:wrap;
  padding:${({theme})=>theme.spacings.sm} 0;border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
