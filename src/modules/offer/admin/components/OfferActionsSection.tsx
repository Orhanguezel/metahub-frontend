"use client";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/offer/locales";
import type { IOffer, OfferStatus } from "@/modules/offer/types";
import { useAppSelector } from "@/store/hooks";
import { updateOfferStatus } from "@/modules/offer/slice/offerSlice";

type Props = { offer?: IOffer; onClose: () => void };

const getId = (o?: IOffer): string => {
  if (!o) return "";
  if (typeof (o as any)?._id === "string") return (o as any)._id;
  const oid = (o as any)?._id?.$oid;
  if (typeof oid === "string") return oid;
  const fb = (o as any)?.id ?? (o as any)?._id;
  return typeof fb === "string" ? fb : String(fb || "");
};

const ALL_STATUSES: OfferStatus[] = [
  "draft",
  "preparing",
  "sent",
  "pending",
  "approved",
  "rejected",
];

export default function OfferActionsSection({ offer, onClose }: Props) {
  const { t } = useI18nNamespace("offer", translations);
  const dispatch = useDispatch<AppDispatch>();

  // store anahtarınız 'offer' veya 'offers' olabilir; güvenli oku
  const loading = useAppSelector(
    (s) => Boolean((s as any)?.offer?.loading ?? (s as any)?.offers?.loading)
  );

  // ---- offer bağımlı değerler
  const id = getId(offer);
  const status: OfferStatus = (offer?.status as OfferStatus) ?? "draft";

  const customerObj = offer?.customer as any;
  const defaultEmail =
    (customerObj?.email as string) ||
    (customerObj?.contactEmail as string) ||
    (offer as any)?.contactEmail ||
    "";

  // ---- local UI state
  const [selectedValue, setSelectedValue] = useState<OfferStatus>(status);
  const [sendOpen, setSendOpen] = useState(false);
  const [pendingSent, setPendingSent] = useState(false);
  const [note, setNote] = useState("");

  // offer değişince UI’yı senkronla
  useEffect(() => {
    setSelectedValue(status);
    setSendOpen(false);
    setPendingSent(false);
    setNote("");
  }, [id, status]);

  const applyStatus = async (next: OfferStatus, withNote?: string) => {
    if (!id) return;
    // unwrap: hata fırlatsın ki catch yakalasın
    await (dispatch as any)(
      updateOfferStatus({ id, status: next, note: withNote })
    ).unwrap();
  };

  const onStatusChange: React.ChangeEventHandler<HTMLSelectElement> = async (e) => {
    const next = e.target.value as OfferStatus;
    if (!id || next === status) return;

    setSelectedValue(next); // optimistic

    if (next === "sent") {
      // e-posta notu için panel aç; patch'i butonda yapacağız
      setPendingSent(true);
      setSendOpen(true);
      return;
    }

    try {
      await applyStatus(next);
    } catch (err) {
      console.error(err);
      alert(t("common.error", "Something went wrong."));
      // geri al
      setSelectedValue(status);
    }
  };

  const confirmSend = async () => {
    if (!id) return;
    try {
      await applyStatus("sent", note || undefined); // backend “sent”te e-posta yollar
      setSendOpen(false);
      setPendingSent(false);
      setNote("");
      // başarılı olunca selectedValue zaten store’dan gelecek statüyle eşitlenecek (effect)
    } catch (err) {
      console.error(err);
      alert(t("common.error", "Something went wrong."));
      // geri al
      setSelectedValue(status);
    }
  };

  const cancelSend = () => {
    setSendOpen(false);
    setPendingSent(false);
    setNote("");
    setSelectedValue(status);
  };

  // ---- render
  return !offer ? null : (
    <Card>
      <Bar>
        <Left>
          <Title>{t("actions.title", "Offer actions")}</Title>
          <StatusPill data-status={status}>
            {t(`status.${status}`, status)}
          </StatusPill>
        </Left>
        <Right>
          <SelectWrap>
            <label htmlFor="offer-status">{t("admin.status", "Status")}</label>
            <select
              id="offer-status"
              value={selectedValue}
              onChange={onStatusChange}
              disabled={loading || !id}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`, s)}
                </option>
              ))}
            </select>
          </SelectWrap>

          <IconBtn onClick={onClose} aria-label={t("common.close","Close")}>
            ×
          </IconBtn>
        </Right>
      </Bar>

      {sendOpen && pendingSent && (
        <Send>
          <Field>
            <label>{t("admin.email","E-mail")}</label>
            <input type="email" value={defaultEmail} readOnly aria-readonly="true" />
          </Field>
          <Field>
            <label>{t("admin.note","Note (optional)")}</label>
            <textarea
              rows={2}
              placeholder={t("admin.notePlaceholder","Short note to include in the email...")}
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
          </Field>
          <SendActions>
            <MiniBtn onClick={confirmSend} disabled={loading || !id}>
              {t("admin.send","Send")}
            </MiniBtn>
            <MiniGhost type="button" onClick={cancelSend}>
              {t("common.cancel","Cancel")}
            </MiniGhost>
          </SendActions>
        </Send>
      )}
    </Card>
  );
}

/* ---- styled ---- */
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  margin-bottom:${({theme})=>theme.spacings.sm};
`;

const Bar = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  padding:${({theme})=>theme.spacings.md};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  ${({theme})=>theme.media.mobile}{ align-items:flex-start; flex-direction:column; }
`;
const Left = styled.div`display:flex; align-items:center; gap:${({theme})=>theme.spacings.sm};`;
const Right = styled.div`display:flex; align-items:center; gap:${({theme})=>theme.spacings.xs};`;
const Title = styled.h4`margin:0; font-size:${({theme})=>theme.fontSizes.md}; color:${({theme})=>theme.colors.title};`;

const StatusPill = styled.span`
  padding:.25rem .6rem; border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  color:${({theme})=>theme.colors.textSecondary};
  &[data-status="preparing"]{ background:${({theme})=>theme.colors.info}; }
  &[data-status="sent"]{ background:${({theme})=>theme.colors.success}; }
  &[data-status="approved"]{ background:${({theme})=>theme.colors.success}; }
  &[data-status="rejected"]{ background:${({theme})=>theme.colors.danger}; }
  &[data-status="pending"]{ background:${({theme})=>theme.colors.warning}; }
  &[data-status="draft"]{ background:${({theme})=>theme.colors.inputBackgroundLight}; }
`;

const IconBtn = styled.button`
  border:none; background:transparent; cursor:pointer; font-size:22px; color:${({theme})=>theme.colors.textSecondary};
  &:hover{ opacity:${({theme})=>theme.opacity.hover}; }
`;

const SelectWrap = styled.label`
  display:flex; align-items:center; gap:8px;
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  select{
    padding:8px 10px;
    border-radius:${({theme})=>theme.radii.md};
    border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
    background:${({theme})=>theme.colors.inputBackground};
    color:${({theme})=>theme.inputs.text};
  }
`;

const MiniBtn = styled.button`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const MiniGhost = styled.button`
  padding:6px 8px; border:none; background:transparent; text-decoration:underline; cursor:pointer;
`;

const Send = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns: 1fr 1fr auto;
  align-items:end;
  padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Field = styled.label`
  display:flex; flex-direction:column; gap:6px;
  input, textarea{
    padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
    border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
    background:${({theme})=>theme.colors.inputBackground}; color:${({theme})=>theme.inputs.text};
  }
  input[readonly]{ opacity:.85; cursor:default; }
`;
const SendActions = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;
