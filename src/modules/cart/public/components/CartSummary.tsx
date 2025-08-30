"use client";

import styled from "styled-components";
import type { ICart, ICartItem } from "@/modules/cart/types";
import type { IMenuItem, IMenuItemVariant, IMenuItemModifierGroup } from "@/modules/menu/types/menuitem";
import { useTranslation } from "react-i18next";

/* ---- helpers ---- */
const currencySymbol = (code?: string) => {
  switch ((code || "").toUpperCase()) {
    case "EUR": return "€";
    case "USD": return "$";
    case "GBP": return "£";
    case "TRY": return "₺";
    default:    return code || "";
  }
};

function isMenuItem(product: unknown): product is IMenuItem {
  return !!product && typeof product === "object" && "_id" in product && "variants" in product;
}

function pickVariantPrice(variant: IMenuItemVariant | undefined, channel: "delivery" | "pickup" | "dinein" = "delivery") {
  const prices = variant?.prices || [];
  const match = prices.find(p => Array.isArray(p.channels) ? p.channels.includes(channel) : true) || prices[0];
  const val = match?.value;
  return val ? { amount: Number(val.amount || 0), currency: String(val.currency || "EUR") } : null;
}

function pickOptionPrice(
  group: IMenuItemModifierGroup,
  optionCode: string,
  channel: "delivery" | "pickup" | "dinein" = "delivery"
) {
  const opt = (group.options || []).find(o => o.code === optionCode);
  const prices = opt?.prices || [];
  const match = prices.find(p => Array.isArray(p.channels) ? p.channels.includes(channel) : true) || prices[0];
  const val = match?.value;
  return val ? { amount: Number(val.amount || 0), currency: String(val.currency || "EUR") } : null;
}

function calcUnit(item: ICartItem): { unit: number; currency: string } {
  const pc = item.priceComponents;
  const fromPc = (pc?.base ?? 0) + (pc?.modifiersTotal ?? 0) + (pc?.deposit ?? 0);
  if (item.priceAtAddition > 0) return { unit: item.priceAtAddition, currency: item.unitCurrency || pc?.currency || "EUR" };
  if (item.unitPrice > 0) return { unit: item.unitPrice, currency: item.unitCurrency || pc?.currency || "EUR" };
  if (fromPc > 0) return { unit: fromPc, currency: item.unitCurrency || pc?.currency || "EUR" };

  if (item.productType === "menuitem" && isMenuItem(item.product)) {
    const mi = item.product as IMenuItem;
    const vCode = item.menu?.variantCode || mi.variants?.find(v => (v as any).isDefault)?.code;
    const variant = mi.variants?.find(v => v.code === vCode) || mi.variants?.[0];
    const base = pickVariantPrice(variant);
    let mods = 0;
    if (Array.isArray(item.menu?.modifiers) && Array.isArray(mi.modifierGroups)) {
      for (const m of item.menu!.modifiers!) {
        const group = mi.modifierGroups.find(g => g.code === m.groupCode);
        const val = group ? pickOptionPrice(group, m.optionCode) : null;
        if (val?.amount != null) {
          const q = typeof m.quantity === "number" && m.quantity > 0 ? m.quantity : 1;
          mods += val.amount * q;
        }
      }
    }
    return { unit: (base?.amount || 0) + mods, currency: base?.currency || "EUR" };
  }

  return { unit: 0, currency: item.unitCurrency || pc?.currency || "EUR" };
}

/* ---- component ---- */

interface Props {
  cart: ICart;
  onClearCart?: () => void;
  onCheckout?: () => void;
}

export default function CartSummary({ cart, onClearCart, onCheckout }: Props) {
  const { t } = useTranslation("cart");

  // Sepet para birimi için sağlam fallback
  const firstItem = cart.items[0];
  const firstCalc = firstItem ? calcUnit(firstItem) : { unit: 0, currency: cart.currency || "EUR" };
  const currencyCode = cart.currency || firstItem?.unitCurrency || firstItem?.priceComponents?.currency || firstCalc.currency || "EUR";
  const sym = currencySymbol(currencyCode);

  // BE totalPrice = 0 gelirse fallback olarak topla
  const fallbackTotal = cart.items.reduce((sum, it) => {
    const { unit } = calcUnit(it);
    return sum + unit * (it.quantity || 0);
  }, 0);

  const total = (Number(cart.totalPrice || 0) > 0 ? Number(cart.totalPrice) : fallbackTotal).toFixed(2);

  return (
    <SummaryBox>
      <h2>{t("summary", "Summary")}</h2>
      <SummaryLine>
        {t("total", "Total")}:<span>{total} {sym}</span>
      </SummaryLine>
      <SummaryLine>
        {t("items", "Items")}:<span>{cart.items.length}</span>
      </SummaryLine>
      <ButtonGroup>
        <ClearButton onClick={onClearCart}>
          {t("clear", "Clear Cart")}
        </ClearButton>
        <CheckoutButton onClick={onCheckout}>
          {t("checkout", "Checkout")}
        </CheckoutButton>
      </ButtonGroup>
    </SummaryBox>
  );
}

/* ---- styles ---- */
const SummaryBox = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 240px;
  gap: ${({ theme }) => theme.spacings.md};
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 1.07rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const ClearButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  &:hover { background: ${({ theme }) => theme.colors.dangerHover || "#e10"}; }
`;

const CheckoutButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;
