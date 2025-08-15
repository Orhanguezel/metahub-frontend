"use client";
import styled, { css } from "styled-components";
import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createPriceList, updatePriceList, createPriceListItem
} from "@/modules/pricelist/slice/pricelistSlice";
import type {
  IPriceList, PriceListStatus, CurrencyCode, TranslatedLabel
} from "@/modules/pricelist/types";
import type { BillingPeriod } from "@/modules/pricelist/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES, getMultiLang } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";

/* consts */
const STATUSES: PriceListStatus[] = ["draft","active","archived"];
const CURRENCIES: CurrencyCode[] = ["USD","EUR","TRY"];
// ✅ Yeni dönemler eklendi
const PERIODS: BillingPeriod[] = [
  "weekly",
  "ten_days",
  "fifteen_days",
  "monthly",
  "quarterly",
  "yearly",
  "once",
];
// Çeviri fallback'ları (çeviri yoksa bunlar görünür)
const PERIOD_LABEL_DEFAULTS: Record<BillingPeriod, string> = {
  weekly: "Weekly",
  ten_days: "Every 10 days",
  fifteen_days: "Every 15 days",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  once: "Once",
};

/* helpers */
const toUpperSnake = (s: string) =>
  s?.toString().trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "").toUpperCase();

type Props = { initial?: IPriceList; onClose: () => void; onSaved?: () => void; };

/* fiyat satırı modeli (yalnızca UI için) */
type NewItem = {
  svcCode: string;
  period: BillingPeriod;
  amount: number | "";
  currency: CurrencyCode;
  isActive: boolean;
  notes?: string;
};

export default function PriceListForm({ initial, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("pricelist", translations);
  const isEdit = !!initial?._id;

  /* ---- active UI locale ---- */
  const uiLocale = useMemo<SupportedLocale>(() => {
    const raw = i18n.language || "en";
    return (SUPPORTED_LOCALES.find(l => raw.startsWith(l)) ?? "en") as SupportedLocale;
  }, [i18n.language]);

  // i18n çıktısını string’e çevir (objeyse aktif dile indirger)
  const T = useCallback(
    (key: string, fallback: string, params?: any) => {
      const v = t(key, fallback as any, params);
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return getMultiLang(v as Partial<TranslatedLabel>, uiLocale) || fallback;
      }
      return String(v ?? fallback);
    },
    [t, uiLocale]
  );

  /* ---- store: relations ---- */
  const serviceCatalog = useAppSelector(s => (s as any).servicecatalog?.items ?? []);

  /* ---- form state ---- */
  const [code, setCode] = useState(initial?.code ?? "");
  const [nameStr, setNameStr] = useState<string>(() => {
    const m = initial?.name as TranslatedLabel | undefined;
    return getMultiLang(m, uiLocale) || "";
  });
  const [descStr, setDescStr] = useState<string>(() => {
    const m = initial?.description as TranslatedLabel | undefined;
    return getMultiLang(m, uiLocale) || "";
  });

  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(initial?.defaultCurrency ?? "EUR");
  const [status, setStatus] = useState<PriceListStatus>(initial?.status ?? "draft");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const [effectiveFrom, setEffectiveFrom] = useState(
    initial?.effectiveFrom ? new Date(initial.effectiveFrom as any).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)
  );
  const [effectiveTo, setEffectiveTo] = useState(
    initial?.effectiveTo ? new Date(initial.effectiveTo as any).toISOString().slice(0,10) : ""
  );

  // ---- Fiyatlar (inline tablo) ----
  const blankRow = (): NewItem => ({
    svcCode: "",
    period: "monthly",
    amount: "" as const,
    currency: defaultCurrency,
    isActive: true,
    notes: ""
  });
  const [rows, setRows] = useState<NewItem[]>([blankRow()]);
  const addRow = () => setRows(r => [...r, blankRow()]);
  const removeRow = (i: number) => setRows(r => r.length > 1 ? r.filter((_,idx)=>idx!==i) : r);
  const updateRow = <K extends keyof NewItem>(i: number, k: K, v: NewItem[K]) =>
    setRows(r => r.map((row, idx) => idx===i ? { ...row, [k]: v } : row));

  const validRows = rows.filter(r => !!r.svcCode && r.amount !== "" && Number(r.amount) >= 0);

  /* ================= submit ================= */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validRows.length === 0) {
      alert(T("items.needOne","Please add at least one price row."));
      return;
    }

    const payload: Partial<IPriceList> = {
      code: code ? toUpperSnake(code) : undefined,
      name: { [uiLocale]: nameStr || "" } as TranslatedLabel,
      description: { [uiLocale]: descStr || "" } as TranslatedLabel,
      defaultCurrency,
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : undefined,
      status,
      isActive,
    };

    try {
      // 1) Listeyi oluştur/güncelle
      const list = isEdit && initial?._id
        ? await dispatch(updatePriceList({ id: initial._id, changes: payload })).unwrap()
        : await dispatch(createPriceList(payload)).unwrap();

      const listId = (list as any)?._id || initial?._id;
      // 2) Satırları kaydet
      for (const r of validRows) {
        await dispatch(createPriceListItem({
          listId,
          payload: {
            serviceCode: toUpperSnake(r.svcCode),
            amount: Number(r.amount),
            currency: r.currency,
            period: r.period,
            notes: r.notes || undefined,
            isActive: r.isActive,
          } as any,
        })).unwrap();
      }

      onSaved?.();
    } catch {
      /* slice toast’ları handle ediyor */
    }
  };

  /* servis seçenekleri */
  const serviceOptions = useMemo(() => {
    const list = serviceCatalog ?? [];
    return list.map((svc: any) => {
      const name = getMultiLang(svc?.name as any, uiLocale);
      return {
        value: String(svc.code || svc._id),
        label: name ? `${name} (${svc.code})` : String(svc.code ?? svc._id),
      };
    });
  }, [serviceCatalog, uiLocale]);

  return (
    <Form onSubmit={submit} aria-describedby="pl-form-desc">
      <SrOnly id="pl-form-desc">{T("form.regionLabel","Create or edit price list")}</SrOnly>

      {/* Basit header alanı */}
      <Grid2>
        <Col>
          <Label htmlFor="pl-code">{T("form.code","Code")}</Label>
          <Input
            id="pl-code"
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            placeholder={T("form.codePh","(auto from name if empty)")}
          />
        </Col>

        <Col>
          <Label htmlFor="pl-curr">{T("form.defaultCurrency","Default Currency")}</Label>
          <Select
            id="pl-curr"
            value={defaultCurrency}
            onChange={(e)=>setDefaultCurrency(e.target.value as CurrencyCode)}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Col>
      </Grid2>

      <Grid2>
        <Col>
          <Label htmlFor="pl-status">{T("form.status","Status")}</Label>
          <Select
            id="pl-status"
            value={status}
            onChange={(e)=>setStatus(e.target.value as PriceListStatus)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{T(`status.${s}`, s)}</option>)}
          </Select>
        </Col>

        <Col>
          <Label>{T("form.isActive","Active?")}</Label>
          <Check>
            <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            <span>{isActive ? T("common.yes","Yes") : T("common.no","No")}</span>
          </Check>
        </Col>
      </Grid2>

      <Grid1>
        <Col>
          <Label htmlFor="pl-name">{T("form.name","Name")} — <small>{uiLocale}</small></Label>
          <Input id="pl-name" value={nameStr} onChange={(e)=>setNameStr(e.target.value)} placeholder={T("form.namePh","Display name")} />
        </Col>
      </Grid1>

      <Grid1>
        <Col>
          <Label htmlFor="pl-desc">{T("form.description","Description")} — <small>{uiLocale}</small></Label>
          <TextArea id="pl-desc" value={descStr} onChange={(e)=>setDescStr(e.target.value)} placeholder={T("form.descriptionPh","Optional")} rows={3} />
        </Col>
      </Grid1>

      <Grid2>
        <Col>
          <Label htmlFor="pl-from">{T("form.effectiveFrom","Effective From")}</Label>
          <Input id="pl-from" type="date" value={effectiveFrom} onChange={(e)=>setEffectiveFrom(e.target.value)} />
        </Col>
        <Col>
          <Label htmlFor="pl-to">{T("form.effectiveTo","Effective To")}</Label>
          <Input id="pl-to" type="date" value={effectiveTo} onChange={(e)=>setEffectiveTo(e.target.value)} />
        </Col>
      </Grid2>

      {/* ---------- Fiyatlar ---------- */}
      <PricesCard>
        <PricesHeader>
          <Sub>{T("items.title","Prices")}</Sub>
          <SmallBtn type="button" onClick={addRow}>{T("items.addRow","+ Add Row")}</SmallBtn>
        </PricesHeader>

        <Table role="table" aria-label={T("items.table","Prices")}>
          <thead>
            <tr>
              <th style={{width:"28%"}}>{T("items.service","Service")}</th>
              <th style={{width:"16%"}}>{T("items.period","Period")}</th>
              <th style={{width:"16%"}}>{T("items.amount","Amount")}</th>
              <th style={{width:"12%"}}>{T("items.currency","Currency")}</th>
              <th style={{width:"16%"}}>{T("items.notes","Notes")}</th>
              <th style={{width:"8%"}}>{T("items.active","Active?")}</th>
              <th style={{width:"4%"}} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i)=>(
              <tr key={i}>
                <td>
                  <Select
                    value={r.svcCode}
                    onChange={(e)=>updateRow(i,"svcCode", e.target.value)}
                  >
                    <option value="">{T("items.selectService","Select service")}</option>
                    {serviceOptions.map((o:{value:string,label:string}) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </td>
                <td>
                  <Select
                    value={r.period}
                    onChange={(e)=>updateRow(i,"period", e.target.value as BillingPeriod)}
                  >
                    {PERIODS.map(p => (
                      <option key={p} value={p}>
                        {T(`period.${p}`, PERIOD_LABEL_DEFAULTS[p])}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <Input
                    type="number" min={0} step="0.01"
                    value={r.amount}
                    onChange={(e)=>updateRow(i,"amount", e.target.value===""? "" : Number(e.target.value))}
                  />
                </td>
                <td>
                  <Select
                    value={r.currency}
                    onChange={(e)=>updateRow(i,"currency", e.target.value as CurrencyCode)}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </td>
                <td>
                  <Input
                    value={r.notes || ""}
                    onChange={(e)=>updateRow(i,"notes", e.target.value)}
                    placeholder={T("items.notesPh","Optional")}
                  />
                </td>
                <td>
                  <Check style={{justifyContent:"center"}}>
                    <input
                      type="checkbox"
                      checked={r.isActive}
                      onChange={(e)=>updateRow(i,"isActive", e.target.checked)}
                    />
                  </Check>
                </td>
                <td>
                  <IconBtn type="button" onClick={()=>removeRow(i)} aria-label={T("actions.remove","Remove")}>×</IconBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {validRows.length===0 && <Hint>{T("items.needOne","Please add at least one price row.")}</Hint>}
      </PricesCard>

      <Actions>
        <Secondary type="button" onClick={onClose}>{T("actions.cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? T("actions.update","Update") : T("actions.create","Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* styled (aynı) */
const SrOnly = styled.span`
  position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);
`;

const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;

const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.lg};`;
const Grid1 = styled.div`display:grid;grid-template-columns:1fr;gap:${({theme})=>theme.spacings.md};`;
const Grid2 = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.md};
  grid-template-columns:repeat(2,1fr);
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:6px;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  resize:vertical; ${focusable}
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Check = styled.label`display:flex;gap:8px;align-items:center;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:10px 18px;border-radius:${({theme})=>theme.radii.md};cursor:pointer; ${focusable}
  &:hover{background:${({theme})=>theme.buttons.primary.backgroundHover};}
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:10px 18px;border-radius:${({theme})=>theme.radii.md};cursor:pointer; ${focusable}
`;

const PricesCard = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;
const PricesHeader = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:${({theme})=>theme.spacings.sm};`;
const Sub = styled.div`font-weight:${({theme})=>theme.fontWeights.semiBold};`;
const Hint = styled.div`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};margin-top:${({theme})=>theme.spacings.xs};`;

const Table = styled.table`
  width:100%;border-collapse:separate;border-spacing:0 ${({theme})=>theme.spacings.xs};
  th{ text-align:left; font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary}; padding:${({theme})=>theme.spacings.xs} 8px; }
  td{ padding:${({theme})=>theme.spacings.xs} 8px; }
  tbody tr{ background:${({theme})=>theme.colors.cardBackground}; box-shadow:${({theme})=>theme.cards.shadow}; }
`;

const SmallBtn = styled.button`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  ${focusable}
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
`;

const IconBtn = styled.button`
  width:32px;height:32px;border-radius:${({theme})=>theme.radii.circle};display:flex;align-items:center;justify-content:center;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.backgroundAlt};cursor:pointer; ${focusable}
  &:hover{background:${({theme})=>theme.colors.hoverBackground};}
`;
