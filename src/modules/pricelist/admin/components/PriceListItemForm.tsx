// src/modules/pricelist/ui/components/PriceListItemForm.tsx
"use client";
import styled, { css } from "styled-components";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createPriceListItem, updatePriceListItem } from "@/modules/pricelist/slice/pricelistSlice";
import type { BillingPeriod, CurrencyCode, IPriceListItem } from "@/modules/pricelist/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";

/* yeni period seti */
const PERIODS: BillingPeriod[] = [
  "weekly",
  "ten_days",
  "fifteen_days",
  "monthly",
  "quarterly",
  "yearly",
  "once",
];
const CURRENCIES: CurrencyCode[] = ["USD","EUR","TRY"];

/* helper */
const toUpperSnake = (s: string) =>
  s?.toString().trim().replace(/\s+/g,"_").replace(/[^A-Za-z0-9_]/g,"").toUpperCase();

export default function PriceListItemForm({
  listId, initial, onClose, onSaved
}: { listId: string; initial?: IPriceListItem; onClose: () => void; onSaved?: () => void; }) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("pricelist", translations);
  const isEdit = !!initial?._id;

  const [serviceCode, setServiceCode] = useState(initial?.serviceCode ?? "");
  const [amount, setAmount] = useState<number>(Number(initial?.amount ?? 0));
  const [currency, setCurrency] = useState<CurrencyCode | "">((initial?.currency as CurrencyCode) ?? "");
  const [period, setPeriod] = useState<BillingPeriod>(initial?.period ?? "monthly");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IPriceListItem> = {
      serviceCode: toUpperSnake(serviceCode),
      amount: Number(amount) || 0,
      currency: currency || undefined, // boşsa backend list.defaultCurrency'yi setler
      period,
      notes: notes || undefined,
      isActive,
    };

    try {
      if (isEdit && initial?._id) {
        await dispatch(updatePriceListItem({ listId, itemId: initial._id, changes: payload })).unwrap();
      } else {
        await dispatch(createPriceListItem({ listId, payload })).unwrap();
      }
      onSaved?.();
    } catch { /* slice toast’ları var */ }
  };

  const periodLabel = (p: BillingPeriod) => t(`period.${p}`, p);

  return (
    <Form onSubmit={submit} aria-describedby="pli-form-desc">
      <SrOnly id="pli-form-desc">{t("items.formRegion","Create or edit price list item")}</SrOnly>

      <Row>
        <Col>
          <Label htmlFor="pli-code">{t("items.serviceCode","Service Code")}</Label>
          <Input
            id="pli-code"
            value={serviceCode}
            onChange={(e)=>setServiceCode(e.target.value)}
            placeholder={t("items.serviceCodePh","WINDOW_CLEAN, etc.")}
            aria-label={t("items.serviceCode","Service Code")}
          />
        </Col>

        <Col>
          <Label htmlFor="pli-amount">{t("items.amount","Amount")}</Label>
          <Input
            id="pli-amount" type="number" min={0} step="0.01"
            value={Number.isFinite(amount) ? amount : 0}
            onChange={(e)=>setAmount(Number(e.target.value) || 0)}
            aria-label={t("items.amount","Amount")}
          />
        </Col>

        <Col>
          <Label htmlFor="pli-curr">{t("items.currency","Currency")}</Label>
          <Select
            id="pli-curr"
            value={currency}
            onChange={(e)=>setCurrency(e.target.value as CurrencyCode)}
            aria-label={t("items.currency","Currency")}
          >
            <option value="">{t("items.listDefault","(list default)")}</option>
            {CURRENCIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </Select>
        </Col>

        <Col>
          <Label htmlFor="pli-period">{t("items.period","Period")}</Label>
          <Select
            id="pli-period"
            value={period}
            onChange={(e)=>setPeriod(e.target.value as BillingPeriod)}
            aria-label={t("items.period","Period")}
          >
            {PERIODS.map(p=> <option key={p} value={p}>{periodLabel(p)}</option>)}
          </Select>
        </Col>
      </Row>

      <Row>
        <Col style={{gridColumn:"span 3"}}>
          <Label htmlFor="pli-notes">{t("items.notes","Notes")}</Label>
          <Input id="pli-notes" value={notes} onChange={(e)=>setNotes(e.target.value)} aria-label={t("items.notes","Notes")} />
        </Col>
        <Col>
          <Label htmlFor="pli-active">{t("items.active","Active")}</Label>
          <Check>
            <input id="pli-active" type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} aria-label={t("items.active","Active")} />
            <span>{isActive? t("common.yes","Yes") : t("common.no","No")}</span>
          </Check>
        </Col>
      </Row>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("actions.cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("actions.update","Update") : t("items.add","Add Item")}</Primary>
      </Actions>
    </Form>
  );
}

/* styled */
const SrOnly = styled.span`
  position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);
`;
const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;

const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.md};
  grid-template-columns:repeat(4,1fr);
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
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
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer; ${focusable}
  &:hover{background:${({theme})=>theme.buttons.primary.backgroundHover};}
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer; ${focusable}
`;
