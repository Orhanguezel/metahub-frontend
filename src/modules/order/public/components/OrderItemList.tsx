"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import type { IOrderItem } from "@/modules/order/types";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";
import { getLocalized } from "@/shared/getLocalized";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES } from "@/types/common";

interface OrderItemListProps {
  items?: IOrderItem[];
  lang?: SupportedLocale;
  /** Opsiyonel: sipariş currency’si, item.unitCurrency yoksa buradan alınır */
  fallbackCurrency?: string;
}

const currencySymbol = (code?: string) => {
  switch ((code || "").toUpperCase()) {
    case "EUR": return "€";
    case "USD": return "$";
    case "GBP": return "£";
    case "TRY": return "₺";
    default:    return code || "";
  }
};

const readDefaultCurrencyFromSettings = (settings: any[]): string => {
  const keys = ["currency_default", "default_currency", "currency"];
  const isCode = (x: unknown) => typeof x === "string" && /^[A-Za-z]{3}$/.test(String(x).trim());
  const pickFromTranslated = (val: Record<string, unknown>) => {
    for (const lng of SUPPORTED_LOCALES) {
      const v = (val as any)?.[lng]; if (isCode(v)) return String(v).toUpperCase();
    }
    for (const v of Object.values(val)) { if (isCode(v)) return String(v).toUpperCase(); }
    return undefined;
  };
  for (const k of keys) {
    const item = settings.find((x: any) => x?.key === k);
    const val = item?.value;
    if (isCode(val)) return String(val).toUpperCase();
    if (Array.isArray(val) && isCode(val[0])) return String(val[0]).toUpperCase();
    if (val && typeof val === "object") {
      const cur = (val as any).currency; if (isCode(cur)) return String(cur).toUpperCase();
      const fromTL = pickFromTranslated(val as Record<string, unknown>); if (fromTL) return fromTL;
    }
  }
  return "TRY";
};

/** Birim fiyatı güvenli biçimde seç (unitPrice > priceComponents toplamı > priceAtAddition > total/qty) */
const pickUnit = (it: IOrderItem) => {
  const pc = it.priceComponents;
  const sumPc = pc ? Number(pc.base || 0) + Number(pc.modifiersTotal || 0) + Number(pc.deposit || 0) : 0;
  const candidates = [
    Number(it.unitPrice || 0),
    sumPc,
    Number((it as any).priceAtAddition || 0),
    ((it as any).totalPriceAtAddition && it.quantity
      ? Number((it as any).totalPriceAtAddition) / it.quantity
      : 0),
  ];
  return candidates.find((n) => typeof n === "number" && isFinite(n) && n > 0) || 0;
};

const OrderItemList: React.FC<OrderItemListProps> = ({
  items = [],
  lang: customLang,
  fallbackCurrency,
}) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (customLang || (i18n.language?.slice(0, 2) as SupportedLocale)) as SupportedLocale;

  const settings = useAppSelector((s) => s.settings?.settingsAdmin || []);
  const defaultCurrency = useMemo(() => readDefaultCurrencyFromSettings(settings), [settings]);
  const effectiveFallback = fallbackCurrency || defaultCurrency;

  if (!Array.isArray(items) || items.length === 0)
    return <Empty>{t("detail.noItems", "No items in order")}</Empty>;

  return (
    <Items>
      {items.map((item, idx) => {
        const product =
          item.product as IBikes | IEnsotekprod | ISparepart | Record<string, any> | undefined;

        // İsim: snapshot > product > fallback
        const snapName =
          (item.menu?.snapshot?.name && getLocalized(item.menu.snapshot.name, lang)) || "";
        const name =
          snapName ||
          (product && typeof product === "object" && "name" in product
            ? (typeof (product as any).name === "object"
                ? getLocalized((product as any).name, lang)
                : String((product as any).name))
            : (item as any).name || t("detail.unnamedProduct", "Unnamed product"));

        const variantLabel =
          (item.menu?.snapshot?.variantName &&
            getLocalized(item.menu.snapshot.variantName, lang)) ||
          item.menu?.variantCode ||
          "";

        const sizeLabel =
          (item.menu?.snapshot?.sizeLabel &&
            getLocalized(item.menu.snapshot.sizeLabel, lang)) || "";

        const mods =
          item.menu?.modifiers?.length
            ? item.menu.modifiers
                .map((m) => `${m.groupCode}:${m.optionCode}${m.quantity && m.quantity > 1 ? `×${m.quantity}` : ""}`)
                .join(", ")
            : "";

        // Fiyat & Para Birimi (fallback)
        const pc = item.priceComponents;
        const currencyCode = item.unitCurrency || pc?.currency || effectiveFallback;
        const sym = currencySymbol(currencyCode);

        // Doğru birim fiyat
        const unit = pickUnit(item);

        // Key
        const key =
          typeof item.product === "object"
            ? ((item.product as any)?._id as string) || `${idx}`
            : String(item.product || idx);

        return (
          <Item key={key}>
            <Left>
              <ProductName title={name}>
                {name}
                {variantLabel ? <Variant>&nbsp;({variantLabel})</Variant> : null}
                {sizeLabel ? <Variant>&nbsp;— {sizeLabel}</Variant> : null}
              </ProductName>
              {mods ? <Modifiers title={mods}>{mods}</Modifiers> : null}

              {/* Fiyat kırılımı */}
              {pc ? (
                <Breakdown>
                  {t("detail.base", "Baz")}: {Number(pc.base || 0).toFixed(2)} {sym}
                  {!!pc.modifiersTotal
                    ? <> • {t("detail.mods", "Ekler")}: {Number(pc.modifiersTotal).toFixed(2)} {sym}</>
                    : null}
                  {pc.deposit
                    ? <> • {t("detail.deposit", "Depozito")}: {Number(pc.deposit).toFixed(2)} {sym}</>
                    : null}
                </Breakdown>
              ) : null}

              {item.menu?.notes ? <Notes>“{item.menu.notes}”</Notes> : null}
            </Left>

            <Right>
              <Qty>
                {item.quantity} <span>×</span>
              </Qty>
              <Price>
                {unit.toFixed(2)} <Currency>{sym}</Currency>
              </Price>
            </Right>
          </Item>
        );
      })}
    </Items>
  );
};

export default OrderItemList;

/* ===== styled ===== */
const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.3rem;
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: left;
  padding: 0.55em 0 0.9em 0;
  opacity: 0.85;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.85rem 0.35rem 0.7rem 0.35rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background 0.2s;
  min-width: 0;
  gap: 0.9em;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.primaryTransparent}; }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.6em;
    align-items: stretch;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: 0.6rem 0.15rem 0.6rem 0.15rem;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  min-width: 0;
  flex: 1;
`;

const ProductName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.06em;
  letter-spacing: 0.01em;
  max-width: 540px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 500px) { max-width: 95vw; }
`;

const Variant = styled.span`
  color: ${({ theme }) => theme.colors.darkGrey};
  font-weight: 500;
  font-size: 0.95em;
`;

const Modifiers = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.92em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Breakdown = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.86em;
`;

const Notes = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
  font-size: 0.9em;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.32em;
  min-width: 160px;
  justify-content: flex-end;
`;

const Qty = styled.span`
  color: ${({ theme }) => theme.colors.darkGrey};
  font-weight: 500;
  font-size: 1.01em;
  span { margin: 0 0.16em; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 700; }
`;

const Price = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.09em;
  margin-left: 0.14em;
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
`;

const Currency = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.98em;
  margin-left: 0.12em;
`;
