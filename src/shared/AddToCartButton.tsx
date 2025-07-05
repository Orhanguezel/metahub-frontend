"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
//import type { SupportedLocale } from "@/types/common";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  children?: React.ReactNode; // Butonun içeriğini override etmek isteyenler için
}

export default function AddToCartButton({
  productId,
  disabled = false,
  children,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation("cart");
  const [added, setAdded] = useState(false);

  const { loading, error, successMessage, cart, stockWarning } = useAppSelector(
    (state) => state.cart
  );

  // Kullanıcı login mi?
  const isAuthenticated = !!useAppSelector((state) => state.account.profile);

  // Sepette bu ürün var mı?
  const isInCart =
    cart?.items?.some(
      (ci) =>
        typeof ci.product === "object" &&
        ci.product !== null &&
        "_id" in ci.product &&
        (ci.product as { _id: string })._id === productId
    ) || false;

  // Login değilse addToCart yerine login'e yönlendir
  const handleClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirected=cart");
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    setAdded(true);
    setTimeout(() => dispatch(clearCartMessages()), 2000);
  };

  // Eğer error not logged in ise yönlendir (future-proof, global fallback)
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
          (loading
            ? t("adding", "Ekleniyor…")
            : isInCart
            ? t("inCart", "Sepette")
            : t("add", "Sepete Ekle"))}
      </StyledButton>
      {/* Mesajlar */}
      {successMessage && added && (
        <CartSuccessMsg>{t("success", "Sepete eklendi!")}</CartSuccessMsg>
      )}
      {stockWarning && added && (
        <StockWarningMsg>{stockWarning}</StockWarningMsg>
      )}
      {error && error !== "Not logged in" && added && (
        <CartErrorMsg>{t("error", "Sepete eklenemedi!")}</CartErrorMsg>
      )}
    </>
  );
}

// --- Styled Components ---
const StyledButton = styled.button<{ $added?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme, $added }) =>
    $added ? theme.colors.success : theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacings.sm};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CartSuccessMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.success || "green"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StockWarningMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.warning || "orange"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CartErrorMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.danger || "red"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
