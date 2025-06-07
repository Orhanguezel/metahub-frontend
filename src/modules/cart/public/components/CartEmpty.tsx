import styled from "styled-components";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function CartEmpty() {
  const { t } = useTranslation("cart");
  return (
    <EmptyBox>
      <ShoppingCart size={60} />
      <p>{t("cart.empty", "Your cart is empty!")}</p>
      <GoShopLink href="/product">{t("cart.shopNow", "Go Shopping")}</GoShopLink>
    </EmptyBox>
  );
}

const EmptyBox = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GoShopLink = styled(Link)`
  margin-top: 14px;
  padding: 8px 20px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
