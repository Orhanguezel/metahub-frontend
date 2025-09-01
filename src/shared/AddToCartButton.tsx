"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, addCartLine, clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cart/locales";
import styled from "styled-components";
import type { ICartMenuSelection, CartLinePriceComponents } from "@/modules/cart/types";

type PriceHint = {
  unitPrice: number;
  currency: string;
  priceComponents?: CartLinePriceComponents;
};

interface AddToCartButtonProps {
  productId: string;
  productType: "bike" | "ensotekprod" | "sparepart" | "menuitem";
  qty?: number;
  menu?: ICartMenuSelection;
  disabled?: boolean;
  children?: React.ReactNode;
  /** FE'de hesaplanan fiyat ipucu */
  priceHint?: PriceHint;
}

export default function AddToCartButton({
  productId,
  productType,
  qty,
  menu,
  disabled = false,
  children,
  priceHint,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useI18nNamespace("cart", translations);
  const [added, setAdded] = useState(false);

  const { loading, error, successMessage, cart, stockWarning } = useAppSelector((s) => s.cart);
  const isAuthenticated = !!useAppSelector((s) => s.account.profile);

  const isInCart =
    cart?.items?.some((ci: any) => {
      if (ci.productType !== productType) return false;
      if (ci.product && typeof ci.product === "object" && "_id" in (ci.product as any)) {
        return String((ci.product as any)._id) === String(productId);
      }
      if (typeof ci.product === "string") return ci.product === productId;
      return false;
    }) || false;

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirected=cart");
      return;
    }
    const quantity = qty && qty > 0 ? qty : 1;

    if (productType === "menuitem") {
      // FE hesapladığımız fiyatı hem ayrı alanlar, hem de priceHint ile gönder
      const unitPrice = priceHint?.unitPrice;
      const unitCurrency = priceHint?.currency;
      const priceComponents = priceHint?.priceComponents;

      dispatch(
        addCartLine({
          menuItemId: productId,
          quantity,
          variantCode: menu?.variantCode,
          modifiers: menu?.modifiers,
          depositIncluded: menu?.depositIncluded,
          notes: menu?.notes,
          currency: unitCurrency,

          // 🔽 doğrudan alanlar
          unitPrice,
          unitCurrency,
          priceComponents,

          // 🔽 tek parça ipucu
          priceHint: priceHint ? {
            unitPrice: priceHint.unitPrice,
            currency: priceHint.currency,
            priceComponents: priceHint.priceComponents,
          } : undefined,
        })
      );
    } else {
      dispatch(addToCart({ productId, productType, quantity }));
    }

    setAdded(true);
    setTimeout(() => dispatch(clearCartMessages()), 2000);
  };

  useEffect(() => {
    if (error === "Not logged in") {
      dispatch(clearCartMessages());
      router.push("/login?redirected=cart");
    }
  }, [error, router, dispatch]);

  return (
    <>
      <StyledButton
        onClick={handleClick}
        disabled={disabled || loading || isInCart}
        aria-label={t("add", "Sepete Ekle")}
        $added={!!successMessage && added}
      >
        {children ||
          (loading ? t("adding", "Ekleniyor…") : isInCart ? t("inCart", "Sepette") : t("add", "Sepete Ekle"))}
      </StyledButton>

      {successMessage && added && <CartSuccessMsg>{t("success", "Sepete eklendi!")}</CartSuccessMsg>}
      {stockWarning && added && <StockWarningMsg>{stockWarning}</StockWarningMsg>}
      {error && error !== "Not logged in" && added && (
        <CartErrorMsg>{t("error", "Sepete eklenemedi!")}</CartErrorMsg>
      )}
    </>
  );
}

const StyledButton = styled.button<{ $added?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme, $added }) => ($added ? theme.colors.success : theme.colors.secondary)};
  color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacings.sm};
  transition: background 0.2s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const CartSuccessMsg = styled.div` margin-top: ${({ theme }) => theme.spacings.xs}; color: ${({ theme }) => theme.colors.success || "green"}; font-size: ${({ theme }) => theme.fontSizes.sm}; `;
const StockWarningMsg = styled.div` margin-top: ${({ theme }) => theme.spacings.xs}; color: ${({ theme }) => theme.colors.warning || "orange"}; font-size: ${({ theme }) => theme.fontSizes.sm}; `;
const CartErrorMsg = styled.div` margin-top: ${({ theme }) => theme.spacings.xs}; color: ${({ theme }) => theme.colors.danger || "red"}; font-size: ${({ theme }) => theme.fontSizes.sm}; `;
