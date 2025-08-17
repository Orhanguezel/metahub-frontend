"use client";
import styled, { css } from "styled-components";
import { useCallback, useId } from "react";
import type { OfferItemProductType } from "@/modules/offer/types";

/** tipler */
export type Opt = { id: string; label: string; sub?: string };
export type ItemsLine = {
  productType: OfferItemProductType;
  ensotekprod?: string;
  sparepart?: string;
  quantity: number;
  unitPrice?: number;
  customPrice?: number;
  vat?: number;
};

type Props = {
  t: (k: string, d?: string) => string;
  lines: ItemsLine[];
  ensotekOpts: Opt[];
  spareOpts: Opt[];
  ensotekById: Record<string, any>;
  spareById: Record<string, any>;
  ml: (v: any) => string;
  addLine: () => void;
  removeLine: (idx: number) => void;
  patchLine: (idx: number, patch: Partial<ItemsLine>) => void;
};

export default function ItemsSection({
  t, lines, ensotekOpts, spareOpts, ensotekById, spareById, ml,
  addLine, removeLine, patchLine
}: Props) {
  const baseId = useId();

  /* number helpers */
  const parseNum = useCallback((val: string): number => {
    const clean = String(val).trim().replace(/\s+/g, "").replace(",", ".");
    const n = Number(clean);
    return Number.isFinite(n) ? n : 0;
  }, []);
  const parseIntMin1 = useCallback((val: string): number => {
    const n = Math.max(1, Math.floor(parseNum(val)));
    return Number.isFinite(n) ? n : 1;
  }, [parseNum]);

  const hasOpt = (opts: Opt[], id?: string) =>
    !!id && opts.some(o => String(o.id) === String(id));

  /** Listeyi üret: mevcut id listede yoksa en üste "(current)" olarak ekle */
  const buildOptions = (opts: Opt[], id?: string, labelFallback?: string): Opt[] => {
    if (!id) return opts;
    if (hasOpt(opts, id)) return opts;
    const safeLabel = (labelFallback && String(labelFallback).trim()) || String(id);
    return [{ id: String(id), label: `${safeLabel} (${t("item.current","current")})` }, ...opts];
  };

  /** pick handlers (id + varsa fiyatı doldur) */
  const handlePickEnsotek = (idx: number, id: string) => {
    const prod = ensotekById[String(id)];
    patchLine(idx, {
      productType: "ensotekprod",
      ensotekprod: id || undefined,
      sparepart: undefined,
      ...(prod && prod.price != null && (lines[idx]?.unitPrice == null)
        ? { unitPrice: Number(prod.price) }
        : {}),
    });
  };
  const handlePickSpare = (idx: number, id: string) => {
    const prod = spareById[String(id)];
    patchLine(idx, {
      productType: "sparepart",
      sparepart: id || undefined,
      ensotekprod: undefined,
      ...(prod && prod.price != null && (lines[idx]?.unitPrice == null)
        ? { unitPrice: Number(prod.price) }
        : {}),
    });
  };

  return (
    <Card>
      <Lines>
        {lines.map((l, idx) => {
          const selEnsotek = l.ensotekprod ? ensotekById[String(l.ensotekprod)] : undefined;
          const selSpare   = l.sparepart   ? spareById[String(l.sparepart)]   : undefined;
          const info = selEnsotek || selSpare;

          const typeId   = `${baseId}-type-${idx}`;
          const nameId   = `${baseId}-name-${idx}`;
          const qtyId    = `${baseId}-qty-${idx}`;
          const unitId   = `${baseId}-unit-${idx}`;
          const customId = `${baseId}-custom-${idx}`;
          const vatId    = `${baseId}-vat-${idx}`;

          const invalid = !l.productType || (!l.ensotekprod && !l.sparepart) || (l.quantity ?? 0) <= 0;

          const ensotekOptions = buildOptions(
            ensotekOpts,
            l.ensotekprod,
            ml(selEnsotek?.name) || (l.ensotekprod ? String(l.ensotekprod) : undefined)
          );
          const spareOptions = buildOptions(
            spareOpts,
            l.sparepart,
            ml(selSpare?.name) || (l.sparepart ? String(l.sparepart) : undefined)
          );

          // value, listedeki opsiyonla eşleşmiyorsa placeholder'a düşsün
          const ensotekValue = hasOpt(ensotekOptions, l.ensotekprod) ? String(l.ensotekprod) : "";
          const spareValue   = hasOpt(spareOptions, l.sparepart) ? String(l.sparepart) : "";

          return (
            <LineRow key={idx} aria-invalid={invalid}>
              <LField>
                <LLabel htmlFor={typeId}>{t("item.type", "Type")}</LLabel>
                <Select
                  id={typeId}
                  aria-label={t("item.type", "Type")}
                  value={l.productType}
                  onChange={(e) =>
                    patchLine(idx, {
                      productType: e.target.value as OfferItemProductType,
                      ensotekprod: undefined,
                      sparepart: undefined,
                    })
                  }
                >
                  <option value="ensotekprod">{t("item.ensotekprod", "Ensotek Product")}</option>
                  <option value="sparepart">{t("item.sparepart", "Spare Part")}</option>
                </Select>
              </LField>

              <LField>
                <LLabel htmlFor={nameId}>{t("item.name", "Name")}</LLabel>

                {l.productType === "ensotekprod" ? (
                  <Select
                    id={nameId}
                    aria-label={t("item.name", "Name")}
                    value={ensotekValue}
                    onChange={(e) => handlePickEnsotek(idx, e.target.value)}
                  >
                    <option value="">{t("item.selectEnsotek", "Select…")}</option>
                    {ensotekOptions.length === 0 && (
                      <option value="" disabled>{t("item.noItems","No items")}</option>
                    )}
                    {ensotekOptions.map((o) => (
                      <option key={`ens-${o.id}`} value={o.id}>
                        {o.label}{o.sub ? ` (${o.sub})` : ""}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    id={nameId}
                    aria-label={t("item.name", "Name")}
                    value={spareValue}
                    onChange={(e) => handlePickSpare(idx, e.target.value)}
                  >
                    <option value="">{t("item.selectSpare", "Select…")}</option>
                    {spareOptions.length === 0 && (
                      <option value="" disabled>{t("item.noItems","No items")}</option>
                    )}
                    {spareOptions.map((o) => (
                      <option key={`spr-${o.id}`} value={o.id}>
                        {o.label}{o.sub ? ` (${o.sub})` : ""}
                      </option>
                    ))}
                  </Select>
                )}
              </LField>

              <LField>
                <LLabel htmlFor={qtyId}>{t("item.qty", "Qty")}</LLabel>
                <Num
                  id={qtyId}
                  aria-label={t("item.qty", "Qty")}
                  value={l.quantity}
                  inputMode="numeric"
                  onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
                  onChange={(e) => patchLine(idx, { quantity: parseIntMin1(e.target.value) })}
                />
              </LField>

              <LField>
                <LLabel htmlFor={unitId}>{t("item.unit", "Unit price")}</LLabel>
                <Num
                  id={unitId}
                  aria-label={t("item.unit", "Unit")}
                  value={l.unitPrice ?? ""}
                  placeholder="0.00"
                  inputMode="decimal"
                  onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
                  onChange={(e) =>
                    patchLine(idx, {
                      unitPrice: e.target.value === "" ? undefined : parseNum(e.target.value),
                    })
                  }
                />
              </LField>

              <LField>
                <LLabel htmlFor={customId}>{t("item.custom", "Custom price")}</LLabel>
                <Num
                  id={customId}
                  aria-label={t("item.custom", "Custom")}
                  value={l.customPrice ?? ""}
                  placeholder="0.00"
                  inputMode="decimal"
                  onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
                  onChange={(e) =>
                    patchLine(idx, {
                      customPrice: e.target.value === "" ? undefined : parseNum(e.target.value),
                    })
                  }
                />
              </LField>

              <LField>
                <LLabel htmlFor={vatId}>{t("item.vat", "VAT %")}</LLabel>
                <Num
                  id={vatId}
                  aria-label={t("item.vat", "VAT")}
                  value={l.vat ?? 19}
                  placeholder="19"
                  inputMode="decimal"
                  onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, parseNum(e.target.value)));
                    patchLine(idx, { vat: v });
                  }}
                />
              </LField>

              <IconBtn
                type="button"
                onClick={() => removeLine(idx)}
                aria-label={t("common.remove", "Remove")}
                title={t("common.remove","Remove")}
              >
                ×
              </IconBtn>

              {info && (
                <ProductInfo data-product-info>
                  <div><b>{ml(info.name)}</b></div>
                  <small>
                    {[info.brand, info.category?.name ? ml(info.category.name) : ""]
                      .filter(Boolean)
                      .join(" • ")}
                  </small>
                  <small>
                    {[
                      info.price != null ? `${info.price}` : "",
                      info.stock != null ? `stk:${info.stock}` : ""
                    ].filter(Boolean).join(" • ")}
                  </small>
                </ProductInfo>
              )}
            </LineRow>
          );
        })}
      </Lines>

      <AddLine type="button" onClick={addLine}>
        {t("item.add", "Add item")}
      </AddLine>
    </Card>
  );
}

/* ---- styled (sadece bu dosya) ---- */
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;

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
const Select = styled.select`${inputBase}; appearance:none;`;
const Num = styled.input.attrs({ type:"text", autoComplete:"off" })`${inputBase};`;

const Lines = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};`;
const LineRow = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.xs};
  grid-template-columns:
    minmax(160px, 200px)
    minmax(260px, 1fr)
    minmax(90px, 120px)
    minmax(120px, 160px)
    minmax(120px, 160px)
    minmax(80px, 110px)
    36px;
  align-items:start;
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
  & > div[data-product-info] { grid-column: 1 / -1; }
`;
const LField = styled.div`display:flex; flex-direction:column; gap:6px;`;
const LLabel = styled.label`color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const ProductInfo = styled.div`
  grid-column: 1 / -1;
  padding: 8px 10px;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  display: flex; gap: 12px; flex-wrap: wrap;
  small { color: ${({ theme }) => theme.colors.textSecondary}; }
`;
const IconBtn = styled.button`
  width:36px; height:36px; border-radius:${({theme})=>theme.radii.circle};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.backgroundAlt}; cursor:pointer; line-height:1;
  &:hover{ opacity:${({theme})=>theme.opacity.hover}; }
`;
const AddLine = styled.button`
  align-self:flex-start; padding:8px 12px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
