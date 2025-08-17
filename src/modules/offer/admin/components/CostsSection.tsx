"use client";
import styled, { css } from "styled-components";
import { useCallback, useId } from "react";

type Props = {
  t: (k: string, d?: string) => string;
  shippingCost: number;
  setShippingCost: (n: number) => void;
  additionalFees: number;
  setAdditionalFees: (n: number) => void;
  discount: number;
  setDiscount: (n: number) => void;
  paymentTerms: string;
  setPaymentTerms: (s: string) => void;
  notes: string;
  setNotes: (s: string) => void;
};

export default function CostsSection({
  t, shippingCost, setShippingCost,
  additionalFees, setAdditionalFees,
  discount, setDiscount,
  paymentTerms, setPaymentTerms,
  notes, setNotes,
}: Props) {
  // virgül/nokta toleranslı, güvenli number parse
  const parseNum = useCallback((val: string): number => {
    const clean = String(val).trim().replace(/\s+/g, "").replace(",", ".");
    const n = Number(clean);
    return Number.isFinite(n) ? n : 0;
  }, []);

  // erişilebilirlik için id'ler
  const shipId = useId();
  const feesId = useId();
  const discId = useId();
  const payId  = useId();
  const notesId = useId();

  return (
    <Card>
      <Grid>
        <Field>
          <Label htmlFor={shipId}>{t("form.shipping","Shipping")}</Label>
          <Num
            id={shipId}
            value={shippingCost}
            placeholder="0.00"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            onChange={(e)=> setShippingCost(parseNum(e.target.value))}
            onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
          />
        </Field>
        <Field>
          <Label htmlFor={feesId}>{t("form.fees","Additional fees")}</Label>
          <Num
            id={feesId}
            value={additionalFees}
            placeholder="0.00"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            onChange={(e)=> setAdditionalFees(parseNum(e.target.value))}
            onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
          />
        </Field>
        <Field>
          <Label htmlFor={discId}>{t("form.discount","Discount")}</Label>
          <Num
            id={discId}
            value={discount}
            placeholder="0.00"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            onChange={(e)=> setDiscount(parseNum(e.target.value))}
            onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
          />
        </Field>
      </Grid>

      <Grid>
        <Field>
          <Label htmlFor={payId}>{t("form.paymentTerms","Payment terms")}</Label>
          <Textarea
            id={payId}
            rows={3}
            dir="auto"
            value={paymentTerms}
            onChange={(e)=> setPaymentTerms(e.target.value)}
            placeholder={t("form.paymentTerms.placeholder","e.g. 50% advance, 50% before shipment")}
          />
        </Field>
        <Field>
          <Label htmlFor={notesId}>{t("form.notes","Notes")}</Label>
          <Textarea
            id={notesId}
            rows={3}
            dir="auto"
            value={notes}
            onChange={(e)=> setNotes(e.target.value)}
            placeholder={t("form.notes.placeholder","Visible notes for the offer")}
          />
        </Field>
      </Grid>
    </Card>
  );
}

/* ---- styled ---- */
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;

const Grid = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.md};
  grid-template-columns: repeat(3, minmax(0,1fr));
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;

const Field = styled.div`min-width:0;`;

const Label = styled.label`
  display:block; margin-bottom:6px;
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

/* Projedeki input görünümlerine uyumlu ortak base */
const inputBase = css`
  width:100%; padding:12px 14px; min-height:44px;
  border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.colors.inputBackground};
  color:${({theme})=>theme.inputs.text};
  transition:border-color ${({theme})=>theme.transition.fast},
           background ${({theme})=>theme.transition.fast},
           box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus};
           box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;

/* type="text" + inputMode="decimal": hem mobil klavye, hem virgül desteği */
const Num = styled.input.attrs<{inputMode?: string; pattern?: string}>({ type:"text", autoComplete:"off" })`
  ${inputBase};
  /* number spinner'larını her yerde gizle */
  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button{ -webkit-appearance: none; margin: 0; }
  &[type="number"]{ -moz-appearance: textfield; }
`;

const Textarea = styled.textarea`
  ${inputBase};
  resize:vertical; min-height:92px;
`;
