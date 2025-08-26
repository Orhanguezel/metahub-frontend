"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { JSONEditor } from "@/shared";
import type { IDeliveryZone } from "@/modules/branch/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/branch/locales";

/* Redux */
import { useDispatch, useSelector } from "react-redux";
import { selectBranchSelected, updateBranch } from "@/modules/branch/slice";

type Props = {
  isOpen: boolean;
  tenant?: string;
  value?: IDeliveryZone[];                 // parent/store’dan gelen gerçek değer
  branchId?: string;                       // <-- eklendi
  onClose?: () => void;
  onSave?: (zones: IDeliveryZone[]) => void;
  onSubmit?: (zones: IDeliveryZone[]) => Promise<void> | void; // verilmezse içerde dispatch(updateBranch)
};

const CURRENCIES = ["TRY", "EUR", "USD"] as const;
type Currency = typeof CURRENCIES[number];

function normalizeCurrency(v: any): Currency {
  const s = String(v || "");
  return (CURRENCIES as readonly string[]).includes(s) ? (s as Currency) : "TRY";
}

function isPolygonCoords(v: any): v is number[][][] {
  return Array.isArray(v) && v.every(
    (ring) => Array.isArray(ring) && ring.every(
      (pt) => Array.isArray(pt) && pt.length === 2 && typeof pt[0] === "number" && typeof pt[1] === "number"
    )
  );
}

/** JSONEditor'dan gelen serbest objeyi güvenli IDeliveryZone'a çevirir */
function toZone(input: any): IDeliveryZone {
  const coords: number[][][] = isPolygonCoords(input?.polygon?.coordinates)
    ? input.polygon.coordinates
    : [];
  const amount = Number(input?.fee?.amount ?? 0);
  const currency = normalizeCurrency(input?.fee?.currency);
  return {
    name: typeof input?.name === "string" ? input.name : "",
    polygon: { type: "Polygon" as const, coordinates: coords },
    fee: {
      amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
      currency,
    },
  };
}

export default function DeliveryZonesForm({
  isOpen,
  tenant,
  value,
  branchId,                // <-- eklendi
  onClose,
  onSave,
  onSubmit,
}: Props) {
  const { t } = useI18nNamespace("branch", translations);

  const dispatch = useDispatch<any>();
  const selected = useSelector(selectBranchSelected);
  const selectedId = selected?._id as string | undefined;
  const initialFromStore = selected?.deliveryZones as IDeliveryZone[] | undefined;

  const [mode, setMode] = useState<"simple" | "json">("simple");
  const [zones, setZones] = useState<IDeliveryZone[]>([]);
  const [open, setOpen] = useState<boolean>(!!isOpen);

  useEffect(() => setOpen(!!isOpen), [isOpen]);

  // 1) prop.value  2) store.selected.deliveryZones  3) default
  useEffect(() => {
    const src = (Array.isArray(value) ? value : initialFromStore) ?? [];
    const fallback: IDeliveryZone[] = [{
      name: "Zone A",
      polygon: {
        type: "Polygon" as const,
        coordinates: [[[13.4,52.52],[13.41,52.52],[13.41,52.53],[13.4,52.53],[13.4,52.52]]],
      },
      fee: { amount: 0, currency: "TRY" as Currency },
    }];

    const normalized: IDeliveryZone[] = (src.length ? src : fallback).map((z) => ({
      name: z?.name || "",
      polygon: {
        type: "Polygon" as const,
        coordinates: isPolygonCoords(z?.polygon?.coordinates) ? z!.polygon.coordinates : [],
      },
      fee: {
        amount: Number(z?.fee?.amount ?? 0),
        currency: normalizeCurrency(z?.fee?.currency),
      },
    }));

    setZones(normalized);
  }, [value, initialFromStore, isOpen]);

  const stop = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); };

  const addZone = (e?: React.MouseEvent) => {
    stop(e);
    setZones((z) => [
      ...z,
      { name: "", polygon: { type: "Polygon" as const, coordinates: [] }, fee: { amount: 0, currency: "TRY" as Currency } },
    ]);
  };

  const removeZone = (idx: number, e?: React.MouseEvent) => { stop(e); setZones((z) => z.filter((_, i) => i !== idx)); };

  const updateZone = (idx: number, patch: Partial<IDeliveryZone>) =>
    setZones((z) => z.map((x, i) => (i === idx ? ({ ...x, ...patch } as IDeliveryZone) : x)));

  const updateFee = (idx: number, patch: Partial<{ amount: number; currency: Currency }>) =>
    setZones((z) =>
      z.map((x, i) =>
        i === idx
          ? { ...x, fee: { amount: Number(patch.amount ?? x.fee?.amount ?? 0), currency: normalizeCurrency(patch.currency ?? x.fee?.currency) } }
          : x
      )
    );

  const [polyText, setPolyText] = useState<string[]>([]);
  useEffect(() => { setPolyText(zones.map((z) => JSON.stringify(z.polygon.coordinates, null, 0))); }, [zones]);

  const setPolyFromText = (idx: number, text: string) => {
    setPolyText((arr) => arr.map((s, i) => (i === idx ? text : s)));
    try {
      const parsed = JSON.parse(text);
      if (isPolygonCoords(parsed)) updateZone(idx, { polygon: { type: "Polygon" as const, coordinates: parsed } });
    } catch {}
  };

  // ESLint için i18n.language yok; sadece zones ve t
  const errors = useMemo(() => {
    const e: string[] = [];
    zones.forEach((z, i) => {
      if (!isPolygonCoords(z.polygon?.coordinates)) e.push(t("dz.error.invalid_polygon", `Zone ${i + 1}: invalid polygon coordinates`));
      if (!z.polygon?.coordinates?.length) e.push(t("dz.error.empty_polygon", `Zone ${i + 1}: polygon is empty`));
      const fee = z.fee;
      if (!fee || isNaN(Number(fee.amount)) || Number(fee.amount) < 0) e.push(t("dz.error.fee_amount", `Zone ${i + 1}: fee.amount must be >= 0`));
      if (fee && !(CURRENCIES as readonly string[]).includes(String(fee.currency))) e.push(t("dz.error.fee_currency", `Zone ${i + 1}: invalid fee.currency`));
    });
    return e;
  }, [zones, t]);

  const handleSave = async (e?: React.MouseEvent) => {
    stop(e);
    if (errors.length) return alert(errors.join("\n"));

    const normalized: IDeliveryZone[] = zones.map((z) => ({
      name: z.name?.trim() || "",
      polygon: { type: "Polygon" as const, coordinates: z.polygon.coordinates },
      fee: { amount: Number(z.fee?.amount || 0), currency: normalizeCurrency(z.fee?.currency) },
    }));

    onSave?.(normalized);

    if (onSubmit) {
      await onSubmit(normalized);
    } else {
      const id = branchId ?? selectedId;
      if (!id) {
        alert("Branch id bulunamadı. Parent’tan branchId geç veya store’da selected’ı set et.");
        return;
      }
      await dispatch(updateBranch({ id, patch: { deliveryZones: normalized } })).unwrap();
    }

    onClose?.();
    setOpen(false);
  };

  const handleClose = (e?: React.MouseEvent) => { stop(e); onClose?.(); setOpen(false); };

  if (!open) {
    return (
      <Collapsed>
        <span>{t("dz.title", "Delivery Zones")}{tenant ? ` — ${tenant}` : ""}</span>
        <Primary onClick={(e)=>{ stop(e); setOpen(true); }}>{t("edit", "Edit")}</Primary>
      </Collapsed>
    );
  }

  return (
    <Wrap role="group" aria-label={t("dz.title", "Delivery Zones")} onKeyDown={(e)=>{ if (e.key === "Enter") e.preventDefault(); }}>
      <Header>
        <h3>{t("dz.title", "Delivery Zones")}{tenant ? ` — ${tenant}` : ""}</h3>
        <ModeSwitch>
          <ModeBtn $active={mode === "simple"} onClick={(e)=>{ stop(e); setMode("simple"); }}>{t("mode.simple","Simple")}</ModeBtn>
          <ModeBtn $active={mode === "json"} onClick={(e)=>{ stop(e); setMode("json"); }}>{t("mode.json","JSON")}</ModeBtn>
        </ModeSwitch>
      </Header>

      {mode === "simple" ? (
        <>
          {zones.map((z, i) => (
            <ZoneCard key={i}>
              <ZoneRow>
                <Col>
                  <Label>{t("dz.name","Name")}</Label>
                  <Input value={z.name || ""} onChange={(e)=>updateZone(i,{name:e.target.value})} placeholder={t("dz.name_ph","Zone A")} />
                </Col>
                <Col>
                  <Label>{t("dz.fee_amount","Fee Amount")}</Label>
                  <Input type="number" min={0} value={z.fee?.amount ?? 0} onChange={(e)=>updateFee(i,{amount:Number(e.target.value)||0})} />
                </Col>
                <Col>
                  <Label>{t("dz.currency","Currency")}</Label>
                  <Select value={z.fee?.currency ?? "TRY"} onChange={(e)=>updateFee(i,{currency: e.target.value as Currency})}>
                    {CURRENCIES.map((c)=> <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Col>
              </ZoneRow>

              <Col style={{ marginTop: 8 }}>
                <Label>{t("dz.poly_label","Polygon Coordinates (JSON — [[[lng,lat],...]])")}</Label>
                <TextArea
                  rows={6}
                  value={polyText[i] ?? ""}
                  onChange={(e)=>setPolyFromText(i, e.target.value)}
                  placeholder='[[[13.40,52.52],[13.41,52.52],[13.41,52.53],[13.40,52.53],[13.40,52.52]]]'
                />
              </Col>

              <ZoneActions>
                <Danger onClick={(e)=>removeZone(i, e)}>{t("remove","Remove")}</Danger>
              </ZoneActions>
            </ZoneCard>
          ))}
          <Row><Secondary onClick={addZone}>{t("dz.add"," + Add Zone")}</Secondary></Row>
          {!!errors.length && <ErrorBox role="alert">{errors.join(" • ")}</ErrorBox>}
        </>
      ) : (
        <JSONEditor
          label={t("dz.json_label","Delivery Zones JSON")}
          value={zones}
          onChange={(v:any)=>{ setZones(Array.isArray(v) ? v.map(toZone) : []); }}
          placeholder={`[
  { "name": "Zone A", "polygon": { "type": "Polygon", "coordinates": [[[13.40,52.52],[13.41,52.52],[13.41,52.53],[13.40,52.53],[13.40,52.52]]] }, "fee": { "amount": 0, "currency": "TRY" } }
]`}
        />
      )}

      <Actions>
        <Secondary onClick={handleClose}>{t("close","Close")}</Secondary>
        <Primary onClick={handleSave}>{t("save","Save")}</Primary>
      </Actions>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`display:flex;flex-direction:column;gap:12px;min-width:360px;`;
const Collapsed = styled.div`display:flex;align-items:center;gap:8px;`;
const Header = styled.div`display:flex;justify-content:space-between;align-items:center;`;
const ModeSwitch = styled.div`display:flex;gap:6px;`;
const ModeBtn = styled.button.attrs({ type: "button" })<{ $active:boolean }>`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
`;
const ZoneCard = styled.div`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  border-radius:${({theme})=>theme.radii.lg};
  padding:12px; background:${({theme})=>theme.colors.cardBackground};
`;
const ZoneRow = styled.div`
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Row = styled.div`display:flex;justify-content:flex-end;`;
const Col = styled.div`display:flex;flex-direction:column;gap:6px;min-width:0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const TextArea = styled.textarea`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const ZoneActions = styled.div`display:flex;justify-content:flex-end;margin-top:8px;`;
const Actions = styled.div`display:flex;gap:8px;justify-content:flex-end;margin-top:8px;`;
const Primary = styled.button.attrs({ type: "button" })`
  background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Secondary = styled.button.attrs({ type: "button" })`
  background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Danger = styled(Secondary)``;
const ErrorBox = styled.div`
  color:${({theme})=>theme.colors.danger};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  padding:8px; border-radius:${({theme})=>theme.radii.md};
`;
