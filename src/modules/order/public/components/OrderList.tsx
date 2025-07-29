"use client";
import React from "react";
import styled from "styled-components";
import { OrderCard } from "@/modules/order";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

type OrderListProps = {
  orders: IOrder[];
};

const OrderList: React.FC<OrderListProps> = ({ orders = [] }) => {
  const { t } = useI18nNamespace("order", translations);

  if (!orders.length)
    return (
      <Empty>
        <span>🗂️</span>
        <div>{t("empty", "No orders found.")}</div>
      </Empty>
    );

  return (
    <ListWrapper>
      {orders.map((order) => (
        <OrderCard key={order._id || (order as any).id} order={order} />
      ))}
    </ListWrapper>
  );
};

export default OrderList;

// --- Styled Components ---
const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted || "#888"};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  margin: 2.5rem auto 0;
  max-width: 550px;
  padding: 3.5rem 1.5rem 2.6rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
  span {
    font-size: 2.4rem;
    display: block;
    margin-bottom: 1.1rem;
    opacity: 0.7;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  width: 100%;
  padding: 0.4rem 0.2rem 0.2rem 0.2rem;
  @media (max-width: 600px) {
    gap: 1.25rem;
    padding: 0.1rem;
  }
`;
