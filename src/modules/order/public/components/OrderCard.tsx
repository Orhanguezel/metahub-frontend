// src/modules/order/public/components/OrderCard.tsx
import React from "react";
import type { Order } from "@/modules/order/types";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const { t } = useTranslation("order");
  return (
    <Card>
      <OrderInfo>
        <span>
          <strong>{t("order.number", "Order #")}</strong>
          {order._id?.slice(-6)}
        </span>
        <Status status={order.status}>
          {t(
            `order.status.${order.status || "undefined"}`,
            order.status ? order.status : t("order.status.undefined", "Unknown")
          )}
        </Status>
      </OrderInfo>
      <Summary>
        <div>
          <b>{t("order.date", "Date")}:</b>{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
        </div>
        <div>
          <b>{t("order.total", "Total")}:</b> €{order.totalPrice?.toFixed(2)}
        </div>
        <div>
          <b>{t("order.items", "Items")}:</b> {order.items.length}
        </div>
      </Summary>
      <ViewButton as={Link} href={`/order/${order._id}`}>
        {t("order.detail", "View Details")}
      </ViewButton>
    </Card>
  );
};


const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OrderInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 500;
`;

const Status = styled.span<{ status?: string }>`
  color: ${({ status, theme }) =>
    status === "completed"
      ? theme.colors.success
      : status === "pending"
      ? theme.colors.warning
      : theme.colors.textSecondary};
  font-weight: 700;
`;

const Summary = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  font-size: 1.04rem;
`;

const ViewButton = styled.a`
  margin-top: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
