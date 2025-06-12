// src/modules/cart/public/components/CartSummary.tsx
import styled from "styled-components";
import type { ICart } from "@/modules/cart/types";
import { useTranslation } from "react-i18next";

interface Props {
  cart: ICart;
  onClearCart?: () => void;
  onCheckout?: () => void; // <-- Satın alma için yeni prop
}

export default function CartSummary({ cart, onClearCart, onCheckout }: Props) {
  const { t } = useTranslation("cart");
  return (
    <SummaryBox>
      <h2>{t("summary", "Summary")}</h2>
      <SummaryLine>
        {t("total", "Total")}:<span>{cart.totalPrice} €</span>
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

const SummaryBox = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 240px;
  gap: ${({ theme }) => theme.spacing.md};
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
  gap: ${({ theme }) => theme.spacing.sm};
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
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover || "#e10"};
  }
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
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
