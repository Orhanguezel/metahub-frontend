"use client";
import React from "react";
import styled from "styled-components";
import { OrderCard } from "@/modules/order";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

type OrderListProps = {
  orders: IOrder[];
};

const OrderList: React.FC<OrderListProps> = ({ orders = [] }) => {
  const { t } = useI18nNamespace("order", translations);

  if (!orders.length) return <Empty>{t("empty", "No orders found.")}</Empty>;

  return (
    <ListWrapper>
      {orders.map((order) => (
        <OrderCard key={order._id || (order as any).id} order={order} />
      ))}
    </ListWrapper>
  );
};

export default OrderList;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.grey || "#888"};
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
