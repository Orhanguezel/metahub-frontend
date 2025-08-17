"use client";
import styled from "styled-components";

type Totals = { totalNet:number; totalVat:number; totalGross:number; grand:number; };

type Props = {
  t: (k:string,d?:string)=>string;
  totals: Totals;
  currency: string;                // yalnızca imza uyumu için; kullanılmıyor
  fmtMoney: (n?:number)=>string;
  shippingCost: number;
  additionalFees: number;
  discount: number;
};

export default function TotalsSection({
  t, totals, fmtMoney, shippingCost, additionalFees, discount
}: Props) {
  return (
    <TotalsCard>
      <TotalsRow><span>{t("detail.subtotal","Subtotal")}</span><b>{fmtMoney(totals.totalNet)}</b></TotalsRow>
      <TotalsRow><span>{t("detail.vat","VAT")}</span><b>{fmtMoney(totals.totalVat)}</b></TotalsRow>
      {!!shippingCost && <TotalsRow><span>{t("detail.shipping","Shipping")}</span><b>{fmtMoney(shippingCost)}</b></TotalsRow>}
      {!!additionalFees && <TotalsRow><span>{t("detail.fees","Fees")}</span><b>{fmtMoney(additionalFees)}</b></TotalsRow>}
      {!!discount && <TotalsRow><span>{t("detail.discount","Discount")}</span><b>-{fmtMoney(discount)}</b></TotalsRow>}
      <GrandRow><span>{t("detail.grandTotal","Grand total")}</span><strong>{fmtMoney(totals.grand)}</strong></GrandRow>
      <PreviewHint>{t("form.previewTotals","This is a live preview. Final totals are calculated when saving.")}</PreviewHint>
    </TotalsCard>
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
const TotalsCard = styled(Card)`max-width:520px; margin-left:auto; display:flex; flex-direction:column; gap:6px;`;
const TotalsRow = styled.div`display:flex; align-items:center; justify-content:space-between;`;
const GrandRow = styled(TotalsRow)`
  padding-top:${({theme})=>theme.spacings.sm};
  margin-top:${({theme})=>theme.spacings.sm};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  font-size:${({theme})=>theme.fontSizes.md};
`;
const PreviewHint = styled.small`opacity:.7;`;
