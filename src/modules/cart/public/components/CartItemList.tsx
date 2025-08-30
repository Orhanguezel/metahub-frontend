"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { increaseQuantity, decreaseQuantity, removeFromCart } from "@/modules/cart/slice/cartSlice";
import type { ICartItem } from "@/modules/cart/types";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";
import type { IMenuItem, IMenuItemVariant, IMenuItemModifierGroup } from "@/modules/menu/types/menuitem";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMultiLang } from "@/types/common";

/* ------------ helpers ------------- */
function isPopulatedNonMenu(
  product: unknown
): product is IBikes | IEnsotekprod | ISparepart {
  return !!product && typeof product === "object" && "_id" in product && "name" in product;
}

function isMenuItem(product: unknown): product is IMenuItem {
  return !!product && typeof product === "object" && "_id" in product && "variants" in product;
}

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  bike: "Bisiklet",
  ensotekprod: "Ensotek Ürün",
  sparepart: "Yedek Parça",
  menuitem: "Menü Ürünü",
};
const PRODUCT_TYPE_SLUG: Record<string, string> = {
  bike: "/bikes/",
  ensotekprod: "/ensotekprod/",
  sparepart: "/sparepart/",
  menuitem: "/menu/",
};

const currencySymbol = (code?: string) => {
  switch ((code || "").toUpperCase()) {
    case "EUR": return "€";
    case "USD": return "$";
    case "GBP": return "£";
    case "TRY": return "₺";
    default:    return code || "";
  }
};

function pickVariantPrice(
  variant: IMenuItemVariant | undefined,
  channel: "delivery" | "pickup" | "dinein" = "delivery"
) {
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

/** Satır için güvenli birim fiyat ve para birimi hesapla (fallback’li) */
function calcUnitAndCurrency(item: ICartItem): { unit: number; currency: string } {
  // 1) BE'nin verdiği alanlar
  const pc = item.priceComponents;
  const fromPc = (pc?.base ?? 0) + (pc?.modifiersTotal ?? 0) + (pc?.deposit ?? 0);
  if (item.priceAtAddition > 0) {
    return { unit: item.priceAtAddition, currency: item.unitCurrency || pc?.currency || "EUR" };
  }
  if (item.unitPrice > 0) {
    return { unit: item.unitPrice, currency: item.unitCurrency || pc?.currency || "EUR" };
  }
  if (fromPc > 0) {
    return { unit: fromPc, currency: item.unitCurrency || pc?.currency || "EUR" };
  }

  // 2) Menü ürünü ise ürün içinden hesapla
  if (item.productType === "menuitem" && isMenuItem(item.product)) {
    const mi = item.product as IMenuItem;
    const variantCode = item.menu?.variantCode || mi.variants?.find(v => (v as any).isDefault)?.code;
    const variant = mi.variants?.find(v => v.code === variantCode) || mi.variants?.[0];
    const base = pickVariantPrice(variant);
    let modifiersTotal = 0;

    if (Array.isArray(item.menu?.modifiers) && Array.isArray(mi.modifierGroups)) {
      for (const pick of item.menu!.modifiers!) {
        const group = mi.modifierGroups.find(g => g.code === pick.groupCode);
        const val = group ? pickOptionPrice(group, pick.optionCode) : null;
        if (val?.amount != null) {
          const qty = typeof pick.quantity === "number" && pick.quantity > 0 ? pick.quantity : 1;
          modifiersTotal += val.amount * qty;
        }
      }
    }
    const amount = (base?.amount || 0) + modifiersTotal;
    const currency = base?.currency || item.unitCurrency || pc?.currency || "EUR";
    return { unit: amount, currency };
  }

  // 3) Son çare
  return { unit: 0, currency: item.unitCurrency || pc?.currency || "EUR" };
}

/* ------------ component ------------- */

interface Props {
  items: ICartItem[];
}

export default function CartItemList({ items }: Props) {
  const { i18n, t } = useTranslation("cart");
  const lang = (i18n.language?.split("-")[0] || "en") as any;
  const dispatch = useAppDispatch();

  return (
    <ListContainer>
      {items.map((item) => {
        const { productType } = item;

        const productId: string =
          (isPopulatedNonMenu(item.product) || isMenuItem(item.product))
            ? String((item.product as any)._id)
            : String(item.product);

        let productName = "-";
        let productSlug = "#";
        let productImage = "";
        let productStock: number | undefined = undefined;

        if (isPopulatedNonMenu(item.product)) {
          productName = getMultiLang((item.product as any).name, lang) || "-";
          const slugBase = PRODUCT_TYPE_SLUG[productType] || "/";
          productSlug = (slugBase && (item.product as any).slug) ? `${slugBase}${(item.product as any).slug}` : "#";
          productImage = (item.product as any).images?.[0]?.url || "";
          productStock = (item.product as any).stock;
        } else if (isMenuItem(item.product)) {
          productName = getMultiLang((item.product as IMenuItem).name as any, lang) || "-";
          const slugBase = PRODUCT_TYPE_SLUG[productType] || "/";
          const slug = (item.product as IMenuItem).slug;
          productSlug = slug ? `${slugBase}${slug}` : "#";
          productImage = (item.product as any).images?.[0]?.url || "";
        }

        const isIncreaseDisabled =
          typeof productStock === "number" && item.quantity >= productStock;

        // ---- Fiyat hesap
        const { unit, currency } = calcUnitAndCurrency(item);
        const sym = currencySymbol(currency);
        const lineTotal = Number(unit || 0) * Number(item.quantity || 0);

        return (
          <CartItemRow key={productId + "-" + productType}>
            <ThumbBox>
              {productImage ? (
                <Image
                  src={productImage}
                  alt={typeof productName === "string" ? productName : "-"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="60px"
                  priority={false}
                />
              ) : (
                <ImgPlaceholder />
              )}
            </ThumbBox>

            <Details>
              <ProductName as={Link} href={productSlug}>
                {productName}
              </ProductName>
              <ProductType>
                {PRODUCT_TYPE_LABEL[productType] || productType}
              </ProductType>

              <Qty>
                <span>{t("quantity", "Miktar")}:</span>
                <QuantityControls>
                  <button
                    onClick={() => dispatch(decreaseQuantity({ productId, productType }))}
                    aria-label={t("decrease", "-")}
                    disabled={item.quantity < 2}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => dispatch(increaseQuantity({ productId, productType }))}
                    aria-label={t("increase", "+")}
                    disabled={isIncreaseDisabled}
                  >
                    +
                  </button>
                  <RemoveBtn
                    onClick={() => dispatch(removeFromCart({ productId, productType }))}
                    title={t("remove", "Sil")}
                  >
                    <X size={17} />
                  </RemoveBtn>
                </QuantityControls>

                {isIncreaseDisabled && (
                  <StockWarning>
                    {t("stockLimit", "Stokta daha fazla ürün yok!")}
                  </StockWarning>
                )}
              </Qty>
            </Details>

            <Price>
              <span>
                {Number(unit).toFixed(2)} {sym}
                {item.quantity > 1 && (
                  <small style={{ color: "#999", marginLeft: 4 }}>x{item.quantity}</small>
                )}
              </span>
              <Total>
                <b>{lineTotal.toFixed(2)} {sym}</b>
              </Total>
            </Price>
          </CartItemRow>
        );
      })}
    </ListContainer>
  );
}

/* ------------ styles ------------- */

// Uyarı
const StockWarning = styled.div`
  color: ${({ theme }) => theme.colors.danger || "#e74c3c"};
  font-size: 0.9em;
  margin-top: 3px;
`;

// Quantity Controls
const QuantityControls = styled.span`
  margin-left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  button {
    width: 24px;
    height: 24px;
    border: none;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    font-weight: 600;
    &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger || "red"};
  cursor: pointer;
  margin-left: 6px;
  transition: color 0.14s;
  &:hover { color: #900; }
`;

// Layout
const ListContainer = styled.div`
  flex: 2;
  min-width: 340px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const CartItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 18px 12px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const ThumbBox = styled.div`
  width: 60px;
  min-width: 60px;
  height: 38px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skeleton};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #e0e5ec;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.2rem;
`;

const Details = styled.div`
  flex: 1;
  min-width: 120px;
`;

const ProductName = styled(Link)`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const ProductType = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  margin-bottom: 2px;
`;

const Qty = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  span { font-weight: 400; }
`;

const Price = styled.div`
  min-width: 120px;
  text-align: right;
  span {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Total = styled.div`
  font-size: 1.12rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;
