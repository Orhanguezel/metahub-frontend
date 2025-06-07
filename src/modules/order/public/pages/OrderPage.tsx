// src/modules/order/public/pages/OrderPage.tsx
"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllOrders, clearOrderMessages } from "@/modules/order/slice/ordersSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { OrderList } from "@/modules/order";
import { Message } from "@/shared"; 

const OrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const { t } = useTranslation("order");

  useEffect(() => {
    dispatch(getAllOrders());
    return () => {
      dispatch(clearOrderMessages());
    };
  }, [dispatch]);

  return (
    <Container>
      <Title>{t("order.title", "My Orders")}</Title>
      {loading && <Message>{t("order.loading", "Loading...")}</Message>}
      {error && <Message $error>{error}</Message>}
      <OrderList orders={orders} />
    </Container>
  );
};

export default OrderPage;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
