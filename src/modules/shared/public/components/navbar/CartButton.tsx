"use client";

import Link from "next/link";
import styled from "styled-components";
import { ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";

interface Props {
  ariaLabel?: string;
}

export default function CartButton({ ariaLabel }: Props) {
  const { cart } = useAppSelector((state) => state.cart);
  const isAuthenticated = !!useAppSelector((state) => state.account.profile);
   const { t } = useI18nNamespace("navbar", translations);

  // Kullanıcı login değilse hiçbir şey gösterme
  if (!isAuthenticated) return null;

  // Sepetteki toplam ürün adedi
  const cartCount =
    cart?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;

  return (
    <CartIconWrapper
      href="/cart"
      aria-label={ariaLabel || t("navbar.cart", "Sepetim")}
    >
      <ShoppingCart size={24} />
      {/* Sadece 1+ ürün varsa badge göster */}
      {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
    </CartIconWrapper>
  );
}

// --- Styled Components ---
const CartIconWrapper = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacings.xs};
  border-radius: 50%;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.danger || "#ff3232"};
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.08);
  pointer-events: none;
`;
