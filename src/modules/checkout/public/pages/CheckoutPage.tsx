"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCart, clearCart } from "@/modules/cart/slice/cartSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { CartItemList, CartSummary, CartEmpty } from "@/modules/cart";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const { t } = useTranslation("cart");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (loading) {
    return <PageContainer>{t("cart.loading", "Loading...")}</PageContainer>;
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <PageContainer>
      <Title>{t("cart.title", "Your Cart")}</Title>
      <Content>
        <CartItemList items={cart.items} />
        <CartSummary cart={cart} onClearCart={() => dispatch(clearCart())} />
      </Content>
    </PageContainer>
  );
};

export default CartPage;

// Styled
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.xl};
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
