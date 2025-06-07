import styled from "styled-components";
import type { ICart } from "@/modules/cart/types";
import { useTranslation } from "react-i18next";

interface Props {
  cart: ICart;
  onClearCart?: () => void;
}

export default function CartSummary({ cart, onClearCart }: Props) {
  const { t } = useTranslation("cart");
  return (
    <SummaryBox>
      <h2>{t("cart.summary", "Summary")}</h2>
      <SummaryLine>
        {t("cart.total", "Total")}:
        <span>{cart.totalPrice} €</span>
      </SummaryLine>
      <SummaryLine>
        {t("cart.items", "Items")}:
        <span>{cart.items.length}</span>
      </SummaryLine>
      <ClearButton onClick={onClearCart}>{t("cart.clear", "Clear Cart")}</ClearButton>
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
