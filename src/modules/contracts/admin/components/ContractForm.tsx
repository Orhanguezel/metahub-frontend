"use client";
import styled from "styled-components";
import { useMemo, useState, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contracts/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createContract, updateContract } from "@/modules/contracts/slice/contractsSlice";
import type {
  IContract, IContractLine, IContractBilling, ContractStatus, BillingPeriod, PeriodUnit, DueRule, TranslatedLabel
} from "@/modules/contracts/types";

interface Props {
  initial?: IContract;
  onClose: () => void;
  onSaved?: () => void;
}

/** Güvenli ref -> id (string) çevirici */
function refToId(ref: any): string {
  if (!ref) return "";
  if (typeof ref === "object" && ref !== null) return String(ref._id || "");
  return String(ref || "");
}

type Opt = { id: string; label: string; sub?: string };

const pickLang = (dict?: Record<string, string>, lang?: string) =>
  (dict && (dict[lang || ""] || dict.en || dict.tr || Object.values(dict)[0])) || "";

export default function ContractForm({ initial, onClose, onSaved }: Props) {
  const { t, i18n } = useI18nNamespace("contracts", translations);
  const lang = (i18n.language?.slice(0,2) || "en") as keyof TranslatedLabel;
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);

  /* ------ state’ten ilişkili veriler ------ */
  const apartments = useAppSelector((s) => (s as any).apartment?.apartmentAdmin ?? (s as any).apartment?.apartment ?? []) as any[];
  const customers  = useAppSelector((s) => (s as any).customer?.customerAdmin ?? []) as any[];
  const services   = useAppSelector((s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []) as any[];

  const apartmentOpts: Opt[] = useMemo(() =>
    (apartments || []).map(a => ({
      id: String(a._id),
      label: pickLang(a.title, String(lang)) || a.slug || String(a._id),
      sub: a.address?.fullText || [a.address?.city, a.address?.country].filter(Boolean).join(", "),
    })), [apartments, lang]);

  const customerOpts: Opt[] = useMemo(() =>
    (customers || []).map(c => ({
      id: String(c._id),
      label: c.companyName?.trim?.() || c.contactName?.trim?.() || c.email || String(c._id),
      sub: [c.email, c.phone].filter(Boolean).join(" • "),
    })), [customers]);

  const serviceOpts: Opt[] = useMemo(() =>
    (services || []).map(s => ({
      id: String(s._id),
      label: (typeof s.name === "string" ? s.name : pickLang(s.name, String(lang))) || s.code || String(s._id),
      sub: s.code,
    })), [services, lang]);

  const findService = useCallback((id: string) => (services || []).find((s:any)=>String(s._id)===String(id)), [services]);

  // Basic
  const [code, setCode] = useState(initial?.code || "");
  const [title, setTitle] = useState<TranslatedLabel>((initial?.title as any) || {});
  const [description, setDescription] = useState<TranslatedLabel>((initial?.description as any) || {});

  // Parties
  const [apartment, setApartment] = useState<string>(refToId(initial?.parties?.apartment));
  const [customer, setCustomer]   = useState<string>(refToId(initial?.parties?.customer));
  const [contactName, setContactName]   = useState(initial?.parties?.contactSnapshot?.name || "");
  const [contactEmail, setContactEmail] = useState(initial?.parties?.contactSnapshot?.email || "");
  const [contactPhone, setContactPhone] = useState(initial?.parties?.contactSnapshot?.phone || "");
  const [contactRole, setContactRole]   = useState(initial?.parties?.contactSnapshot?.role || "");

  // Billing
  const [mode, setMode] = useState<IContractBilling["mode"]>(initial?.billing.mode || "fixed");
  const [amount, setAmount] = useState<number>(Number(initial?.billing.amount ?? 0));
  const [currency, setCurrency] = useState<string>(initial?.billing.currency || "EUR");
  const [period, setPeriod] = useState<BillingPeriod>(initial?.billing.period || "monthly");
  const [dueType, setDueType] = useState<DueRule["type"]>(initial?.billing.dueRule?.type || "dayOfMonth");
  const [day, setDay] = useState<number>((initial?.billing.dueRule as any)?.day ?? 1);
  const [nth, setNth] = useState<number>((initial?.billing.dueRule as any)?.nth ?? 1);
  const [weekday, setWeekday] = useState<number>((initial?.billing.dueRule as any)?.weekday ?? 1);
  const [startDate, setStartDate] = useState<string>(
    initial?.billing.startDate ? new Date(initial.billing.startDate).toISOString().slice(0,10) : ""
  );
  const [endDate, setEndDate] = useState<string>(
    initial?.billing.endDate ? new Date(initial.billing.endDate).toISOString().slice(0,10) : ""
  );
  const [graceDays, setGraceDays] = useState<number>(Number(initial?.billing.graceDays ?? 0));

  // Lines
  const [lines, setLines] = useState<IContractLine[]>(initial?.lines || []);

  // Status/Active
  const [status, setStatus] = useState<ContractStatus>(initial?.status || "draft");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const dueRule = useMemo<DueRule>(() => {
    return dueType === "dayOfMonth"
      ? { type: "dayOfMonth", day: Math.min(31, Math.max(1, Number(day) || 1)) }
      : { type: "nthWeekday", nth: (Math.min(5, Math.max(1, Number(nth) || 1)) as 1|2|3|4|5), weekday: (Math.min(6, Math.max(0, Number(weekday) || 1)) as any) };
  }, [dueType, day, nth, weekday]);

  const upsertLine = (idx: number, patch: Partial<IContractLine>) =>
    setLines((arr) => arr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const onChangeLineService = (idx: number, svcId: string) => {
    const svc = findService(svcId);
    const current = lines[idx];
    const nextName: TranslatedLabel = {
      ...(current.name || {}),
      [lang]: (current.name?.[lang] || (typeof svc?.name === "string" ? svc?.name : pickLang(svc?.name, String(lang)))) || "",
    };
    const defaultHead = Number(svc?.defaultTeamSize) || current.manpower?.headcount || 1;
    const defaultDur  = Number(svc?.defaultDurationMin) || current.manpower?.durationMinutes || 60;
    upsertLine(idx, {
      service: svcId as any,
      name: nextName,
      manpower: { headcount: defaultHead, durationMinutes: defaultDur },
    });
  };

  const addLine = () =>
    setLines((arr) => [
      ...arr,
      {
        service: "" as any,
        isActive: true,
        schedule: { every: 1, unit: "week" as PeriodUnit },
        manpower: { headcount: 1, durationMinutes: 60 },
      } as IContractLine,
    ]);

  const removeLine = (idx: number) =>
    setLines((arr) => arr.filter((_, i) => i !== idx));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<IContract> = {
      code: code || undefined,
      title,
      description,
      parties: {
        apartment,
        customer: customer || undefined,
        contactSnapshot:
          contactName || contactEmail || contactPhone || contactRole
            ? { name: contactName, email: contactEmail || undefined, phone: contactPhone || undefined, role: contactRole || undefined }
            : undefined,
      },
      lines: lines.map((l) => ({
        ...l,
        service: typeof l.service === "object" ? String((l.service as any)?._id) : l.service, // id olarak gönder
        name: l.name,
        description: l.description,
      })),
      billing: {
        mode,
        amount: mode === "fixed" ? Number(amount) : undefined,
        currency,
        period,
        dueRule,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        graceDays: Number(graceDays) || 0,
      },
      status,
      isActive,
    };

    try {
      if (isEdit && initial) {
        await dispatch(updateContract({ id: initial._id, changes: payload })).unwrap();
      } else {
        await dispatch(createContract(payload)).unwrap();
      }
      onSaved?.();
    } catch {/* toast üst parent’ta */}
  };

  const weekdayLabels = [0,1,2,3,4,5,6].map(d => ({ value: d, label: t(`weekdays.${d}`, String(d)) }));

  return (
    <Form onSubmit={onSubmit}>
      {/* Title/Desc */}
      <Row>
        <Col>
          <Label htmlFor="code">{t("labels.code","Code")}</Label>
          <Input id="code" value={code} onChange={(e)=>setCode(e.target.value)} placeholder={t("placeholders.autoIfEmpty","(auto if empty)")} />
        </Col>
        <Col>
          <Label htmlFor="title">{t("labels.title","Title")} ({String(lang)})</Label>
          <Input
            id="title"
            value={title?.[lang] || ""}
            onChange={(e)=>setTitle({ ...title, [lang]: e.target.value })}
          />
        </Col>
        <Col span2>
          <Label htmlFor="desc">{t("labels.description","Description")} ({String(lang)})</Label>
          <TextArea
            id="desc"
            rows={2}
            value={description?.[lang] || ""}
            onChange={(e)=>setDescription({ ...description, [lang]: e.target.value })}
          />
        </Col>
      </Row>

      {/* Parties */}
      <BlockTitle>{t("labels.parties","Parties")}</BlockTitle>
      <Row>
        <Col>
          <Label htmlFor="apartment">{t("labels.apartment","Apartment")}</Label>
          <Select id="apartment" value={apartment} onChange={(e)=>setApartment(e.target.value)} required>
            <option value="">{t("placeholders.select","Select")}</option>
            {apartmentOpts.map(o=>(
              <option key={o.id} value={o.id}>{o.label}{o.sub ? ` — ${o.sub}` : ""}</option>
            ))}
          </Select>
        </Col>
        <Col>
          <Label htmlFor="customer">{t("labels.customer","Customer")}</Label>
          <Select id="customer" value={customer} onChange={(e)=>setCustomer(e.target.value)}>
            <option value="">{t("common.optional","(optional)")}</option>
            {customerOpts.map(o=>(
              <option key={o.id} value={o.id}>{o.label}{o.sub ? ` — ${o.sub}` : ""}</option>
            ))}
          </Select>
        </Col>
        <Col>
          <Label htmlFor="contactName">{t("labels.contactName","Contact Name")}</Label>
          <Input id="contactName" value={contactName} onChange={(e)=>setContactName(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("labels.contactDetails","Contact Details")}</Label>
          <FlexRow>
            <Input aria-label={t("labels.email","Email")} placeholder={t("labels.email","Email")} value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
            <Input aria-label={t("labels.phone","Phone")} placeholder={t("labels.phone","Phone")} value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
            <Input aria-label={t("labels.role","Role")} placeholder={t("labels.role","Role")} value={contactRole} onChange={(e)=>setContactRole(e.target.value)} />
          </FlexRow>
        </Col>
      </Row>

      {/* Billing */}
      <BlockTitle>{t("labels.billing","Billing")}</BlockTitle>
      <Row>
        <Col>
          <Label htmlFor="mode">{t("labels.mode","Mode")}</Label>
          <Select id="mode" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
            <option value="fixed">{t("billing.fixed","fixed")}</option>
            <option value="perLine">{t("billing.perLine","perLine")}</option>
          </Select>
        </Col>
        <Col>
          <Label htmlFor="amount">{t("labels.amount","Amount")}</Label>
          <Input id="amount" type="number" step="0.01" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} disabled={mode!=="fixed"} />
        </Col>
        <Col>
          <Label htmlFor="currency">{t("labels.currency","Currency")}</Label>
          <Input id="currency" value={currency} onChange={(e)=>setCurrency(e.target.value)} />
        </Col>
        <Col>
          <Label htmlFor="period">{t("labels.periodL","Period")}</Label>
          <Select id="period" value={period} onChange={(e)=>setPeriod(e.target.value as BillingPeriod)}>
            {["weekly","monthly","quarterly","yearly"].map(p=><option key={p} value={p}>{t(`period.${p}`, p)}</option>)}
          </Select>
        </Col>
      </Row>

      {/* Due Rule + Dates */}
      <Row>
        <Col>
          <Label htmlFor="dueType">{t("labels.dueRule","Due Rule")}</Label>
          <Select id="dueType" value={dueType} onChange={(e)=>setDueType(e.target.value as any)}>
            <option value="dayOfMonth">{t("dueRule.dayOfMonth","dayOfMonth")}</option>
            <option value="nthWeekday">{t("dueRule.nthWeekday","nthWeekday")}</option>
          </Select>
        </Col>
        {dueType === "dayOfMonth" ? (
          <Col>
            <Label htmlFor="dueDay">{t("dueRule.day","Day")}</Label>
            <Input id="dueDay" type="number" min={1} max={31} value={day} onChange={(e)=>setDay(Number(e.target.value))} />
          </Col>
        ) : (
          <>
            <Col>
              <Label htmlFor="dueNth">{t("dueRule.nth","Nth")}</Label>
              <Select id="dueNth" value={nth} onChange={(e)=>setNth(Number(e.target.value))}>
                {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
              </Select>
            </Col>
            <Col>
              <Label htmlFor="dueWeekday">{t("dueRule.weekday","Weekday")}</Label>
              <Select id="dueWeekday" value={weekday} onChange={(e)=>setWeekday(Number(e.target.value))}>
                {weekdayLabels.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </Select>
            </Col>
          </>
        )}
        <Col>
          <Label htmlFor="graceDays">{t("labels.graceDays","Grace Days")}</Label>
          <Input id="graceDays" type="number" min={0} value={graceDays} onChange={(e)=>setGraceDays(Number(e.target.value))} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label htmlFor="startDate">{t("labels.startDate","Start Date")}</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} required aria-describedby="dateHint" />
          <Hint id="dateHint">{t("hints.dateFormat","YYYY-MM-DD")}</Hint>
        </Col>
        <Col>
          <Label htmlFor="endDate">{t("labels.endDate","End Date")}</Label>
          <Input id="endDate" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} aria-describedby="dateHint" />
          <Hint>{t("hints.optional","Optional")}</Hint>
        </Col>
        <Col>
          <Label htmlFor="status">{t("labels.status","Status")}</Label>
          <Select id="status" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
            {["draft","active","suspended","terminated","expired"].map(s=><option key={s} value={s}>{t(`statuses.${s}`, s)}</option>)}
          </Select>
        </Col>
        <Col>
          <Label>{t("labels.active","Active")}</Label>
          <CheckRow>
            <input id="isActive" type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            <span>{isActive ? t("common.yes","Yes") : t("common.no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      {/* Lines */}
      <BlockTitle>{t("labels.lines","Lines")}</BlockTitle>
      {lines.map((l, idx)=>(
        <Row key={idx}>
          <Col>
            <Label htmlFor={`svc-${idx}`}>{t("labels.service","Service")}</Label>
            <Select
              id={`svc-${idx}`}
              value={typeof l.service === "object" ? (l.service as any)?._id : (l.service as any) || ""}
              onChange={(e)=>onChangeLineService(idx, e.target.value)}
            >
              <option value="">{t("placeholders.select","Select")}</option>
              {serviceOpts.map(o=>(
                <option key={o.id} value={o.id}>{o.label}{o.sub?` — ${o.sub}`:""}</option>
              ))}
            </Select>
          </Col>
          <Col>
            <Label htmlFor={`ln-title-${idx}`}>{t("labels.title","Title")} ({String(lang)})</Label>
            <Input
              id={`ln-title-${idx}`}
              value={(l.name as any)?.[lang] || ""}
              onChange={(e)=>upsertLine(idx, { name: { ...(l.name||{}), [lang]: e.target.value } })}
            />
          </Col>
          <Col>
            <Label htmlFor={`ln-price-${idx}`}>{t("labels.unitPrice","Unit Price")}</Label>
            <Input
              id={`ln-price-${idx}`}
              type="number" step="0.01"
              value={l.unitPrice ?? ""}
              onChange={(e)=>upsertLine(idx, { unitPrice: e.target.value===""? undefined : Number(e.target.value) })}
            />
          </Col>
          <Col>
            <Label htmlFor={`ln-cur-${idx}`}>{t("labels.currency","Currency")}</Label>
            <Input id={`ln-cur-${idx}`} value={l.currency || ""} onChange={(e)=>upsertLine(idx, { currency: e.target.value || undefined })} />
          </Col>

          <Col>
            <Label htmlFor={`ln-inc-${idx}`}>{t("labels.included","Included In Contract Price")}</Label>
            <CheckRow>
              <input
                id={`ln-inc-${idx}`}
                type="checkbox"
                checked={!!l.isIncludedInContractPrice}
                onChange={(e)=>upsertLine(idx, { isIncludedInContractPrice: e.target.checked })}
              />
            </CheckRow>
          </Col>

          {/* SCHEDULE */}
          <Col>
            <Label>{t("labels.schedule","Schedule")}</Label>
            <FlexRow>
              <Input
                aria-label={t("labels.every","Every")}
                placeholder={t("labels.every","Every")}
                type="number"
                min={1}
                value={l.schedule?.every ?? ""}
                onChange={(e)=>{
                  const val = Number(e.target.value);
                  const every = Number.isFinite(val) && val > 0 ? val : (l.schedule?.every ?? 1);
                  upsertLine(idx, {
                    schedule: {
                      every,
                      unit: (l.schedule?.unit || "week") as PeriodUnit,
                      daysOfWeek: l.schedule?.daysOfWeek,
                      exceptions: l.schedule?.exceptions,
                    },
                  });
                }}
              />
              <Select
                aria-label={t("labels.unit","Unit")}
                value={l.schedule?.unit || "week"}
                onChange={(e)=>
                  upsertLine(idx, {
                    schedule: {
                      every: l.schedule?.every ?? 1,
                      unit: e.target.value as PeriodUnit,
                      daysOfWeek: l.schedule?.daysOfWeek,
                      exceptions: l.schedule?.exceptions,
                    },
                  })
                }
              >
                {["day","week","month"].map(u=><option key={u} value={u}>{t(`units.${u}`, u)}</option>)}
              </Select>
            </FlexRow>
          </Col>

          {/* MANPOWER */}
          <Col>
            <Label>{t("labels.manpower","Manpower")}</Label>
            <FlexRow>
              <Input
                aria-label={t("labels.headcount","Headcount")}
                placeholder={t("labels.headcount","Headcount")}
                type="number"
                min={1}
                value={l.manpower?.headcount ?? ""}
                onChange={(e)=>{
                  const headcount = Math.max(1, Number(e.target.value) || 1);
                  const duration = l.manpower?.durationMinutes ?? 60;
                  upsertLine(idx, { manpower: { headcount, durationMinutes: duration } });
                }}
              />
              <Input
                aria-label={t("labels.duration","Duration (min)")}
                placeholder={t("labels.duration","Duration (min)")}
                type="number"
                min={1}
                value={l.manpower?.durationMinutes ?? ""}
                onChange={(e)=>{
                  const duration = Math.max(1, Number(e.target.value) || 60);
                  const headcount = l.manpower?.headcount ?? 1;
                  upsertLine(idx, { manpower: { headcount, durationMinutes: duration } });
                }}
              />
            </FlexRow>
          </Col>

          <BtnRow>
            <Small onClick={(ev)=>{ev.preventDefault(); addLine();}}>{t("actions.add","Add")}</Small>
            {lines.length>0 && (
              <Small onClick={(ev)=>{ev.preventDefault(); removeLine(idx);}}>{t("actions.remove","Remove")}</Small>
            )}
          </BtnRow>
        </Row>
      ))}
      {lines.length===0 && (
        <BtnRow><Small onClick={(ev)=>{ev.preventDefault(); addLine();}}>{t("actions.add","Add")}</Small></BtnRow>
      )}

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("actions.cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("actions.update","Update") : t("actions.create","Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div<{span2?: boolean}>`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};
  ${({span2})=>span2 && `grid-column: span 2;`}
`;
const BlockTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md};margin:${({theme})=>theme.spacings.sm} 0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Hint = styled.div`margin-top:4px;font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.text};`;
const Input = styled.input`
  width:100%;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;
const TextArea = styled.textarea`
  width:100%;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;
const Select = styled.select`
  width:100%;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const FlexRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;& > * { flex:1 1 180px; }`;
const BtnRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:flex-end;flex-wrap:wrap;`;
const Small = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;flex-wrap:wrap;`;
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
