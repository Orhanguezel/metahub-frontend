"use client";
import { AddBtn, Col, Input, Label, Row } from "../ItemForm.styles";
import type { TFunc } from "./types";
import type { ItemPrice, PriceChannel, PriceKind, CurrencyCode } from "@/modules/menu/types/menuitem";
import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES } from "@/types/common";
import {
  PRICE_KIND_KEYS,
  CHANNEL_KEYS,
  useFoodLabelHelpers,
} from "@/modules/menu/constants/foodLabels";

const CURRENCIES: readonly CurrencyCode[] = ["TRY", "EUR", "USD"] as const;

type Props = {
  prices: ItemPrice[] | undefined;
  onChange: (next: ItemPrice[]) => void;
  t: TFunc;
};

export default function PriceListEditor({ prices = [], onChange, t }: Props) {
  const settings = useAppSelector((s) => s.settings?.settingsAdmin || []);
  const { priceKindLabel, channelLabel } = useFoodLabelHelpers();

  const defaultCurrency = useMemo<CurrencyCode>(() => {
    const keys = ["currency_default", "default_currency", "currency"];
    const isAllowed = (x: string): x is CurrencyCode => (CURRENCIES as readonly string[]).includes(x.toUpperCase());
    const pickFromTranslated = (val: Record<string, unknown>) => {
      for (const lng of SUPPORTED_LOCALES) {
        const v = (val as any)?.[lng];
        if (typeof v === "string" && isAllowed(v)) return v.toUpperCase() as CurrencyCode;
      }
      for (const v of Object.values(val)) {
        if (typeof v === "string" && isAllowed(v)) return (v as string).toUpperCase() as CurrencyCode;
      }
      return undefined;
    };
    for (const k of keys) {
      const item = settings.find((x: any) => x?.key === k);
      const val = item?.value;
      if (typeof val === "string" && isAllowed(val)) return val.toUpperCase() as CurrencyCode;
      if (Array.isArray(val) && typeof val[0] === "string" && isAllowed(val[0])) return (val[0] as string).toUpperCase() as CurrencyCode;
      if (val && typeof val === "object") {
        const cur = (val as any).currency;
        if (typeof cur === "string" && isAllowed(cur)) return cur.toUpperCase() as CurrencyCode;
        const fromTL = pickFromTranslated(val as Record<string, unknown>);
        if (fromTL) return fromTL;
      }
    }
    return "TRY";
  }, [settings]);

  const add = () =>
    onChange([
      ...prices,
      { kind: "base", value: { amount: 0, currency: defaultCurrency, taxIncluded: true } },
    ]);

  const remove = (i: number) => onChange(prices.filter((_, idx) => idx !== i));

  const up = (i: number, patch: Partial<ItemPrice>) =>
    onChange(prices.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const upVal = (i: number, patch: Partial<ItemPrice["value"]>) =>
    onChange(
      prices.map((p, idx) =>
        idx === i ? { ...p, value: { ...(p.value || {}), ...patch } } : p
      )
    );

  const toggleChannel = (i: number, ch: PriceChannel) => {
    const set = new Set(prices[i]?.channels || []);
    if (set.has(ch)) set.delete(ch);
    else set.add(ch);
    up(i, { channels: Array.from(set) as PriceChannel[] });
  };

  return (
    <>
      {prices.map((p, i) => (
        <div
          key={`price-${i}`}
          style={{ border: "1px dashed #e1e1e1", padding: 8, borderRadius: 8, marginBottom: 8 }}
        >
          <Row>
            <Col>
              <Label>{t("kind", "Kind")}</Label>
              <select
                value={p.kind}
                onChange={(e) => up(i, { kind: e.target.value as PriceKind })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
              >
                {PRICE_KIND_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {priceKindLabel(k)}
                  </option>
                ))}
              </select>
            </Col>

            <Col>
              <Label>{t("amount", "Amount")}</Label>
              <Input
                type="number"
                step="0.01"
                value={p.value?.amount ?? ""}
                onChange={(e) =>
                  upVal(i, {
                    amount: e.target.value === "" ? ("" as any) : Number(e.target.value),
                  })
                }
              />
            </Col>

            <Col>
              <Label>{t("currency", "Currency")}</Label>
              <select
                value={p.value?.currency || defaultCurrency}
                onChange={(e) => upVal(i, { currency: e.target.value as CurrencyCode })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Col>

            <Col>
              <Label>{t("taxIncluded", "Tax included?")}</Label>
              <div style={{ paddingTop: 10 }}>
                <input
                  type="checkbox"
                  checked={!!p.value?.taxIncluded}
                  onChange={(e) => upVal(i, { taxIncluded: e.target.checked })}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("minQty", "Min qty")}</Label>
              <Input
                type="number"
                min={0}
                value={p.minQty ?? ""}
                onChange={(e) =>
                  up(i, { minQty: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </Col>
            <Col>
              <Label>{t("outlet", "Outlet")}</Label>
              <Input value={p.outlet || ""} onChange={(e) => up(i, { outlet: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("activeFrom", "Active from")}</Label>
              <Input
                type="date"
                value={p.activeFrom ? String(p.activeFrom).slice(0, 10) : ""}
                onChange={(e) => up(i, { activeFrom: e.target.value || undefined })}
              />
            </Col>
            <Col>
              <Label>{t("activeTo", "Active to")}</Label>
              <Input
                type="date"
                value={p.activeTo ? String(p.activeTo).slice(0, 10) : ""}
                onChange={(e) => up(i, { activeTo: e.target.value || undefined })}
              />
            </Col>
          </Row>

          <Row>
            <Col style={{ gridColumn: "span 3" }}>
              <Label>{t("channels", "Channels")}</Label>
              <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                {CHANNEL_KEYS.map((ch) => (
                  <label key={ch} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={(p.channels || []).includes(ch)}
                      onChange={() => toggleChannel(i, ch)}
                    />
                    <span>{channelLabel(ch)}</span>
                  </label>
                ))}
              </div>
            </Col>
            <Col>
              <Label>{t("note", "Note")}</Label>
              <Input value={p.note || ""} onChange={(e) => up(i, { note: e.target.value })} />
            </Col>
          </Row>

          <Row>
            <Col style={{ alignItems: "flex-end" }}>
              <button type="button" onClick={() => remove(i)}>
                − {t("remove", "Remove")}
              </button>
            </Col>
          </Row>
        </div>
      ))}

      <AddBtn type="button" onClick={add}>
        + {t("addPrice", "Add Price")}
      </AddBtn>
    </>
  );
}
