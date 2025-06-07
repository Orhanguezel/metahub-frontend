// src/modules/order/public/components/OrderList.tsx
import React from "react";
import type { Order } from "@/modules/order/types";
import { OrderCard } from "@/modules/order";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  const { t } = useTranslation("order");

  if (!orders || orders.length === 0) {
    return <EmptyMsg>{t("order.empty", "You have no orders yet.")}</EmptyMsg>;
  }

  return (
    <List>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </List>
  );
};

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.05rem;
  margin-top: 24px;
  text-align: center;
`;
