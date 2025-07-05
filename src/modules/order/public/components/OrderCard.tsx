"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { OrderItemList, OrderDetail } from "@/modules/order";
import { useTranslation } from "react-i18next";
import { getLocalized } from "@/shared/getLocalized";
import type { IOrder } from "@/modules/order/types";

// --- Props tipi
type OrderCardProps = {
  order: IOrder;
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showDetail, setShowDetail] = useState(false);
  const { i18n, t } = useTranslation("order");
  const lang = i18n.language || "en";

  if (!order) return null;

  const { _id, createdAt, totalPrice, items, status, shippingAddress } = order;

  return (
    <Card>
      <CardTopRow>
        <OrderInfo>
          <OrderNumber>
            {t("orderNumber", "Order #")}
            {_id?.toString().slice(-6)}
          </OrderNumber>
          <DateSpan>
            {createdAt ? new Date(createdAt).toLocaleString() : "-"}
          </DateSpan>
        </OrderInfo>
        <Status $status={status}>{t(status, status)}</Status>
      </CardTopRow>
      {shippingAddress?.name && (
        <BuyerName>{getLocalized(shippingAddress.name, lang)}</BuyerName>
      )}
      <OrderItemList items={items} lang={lang} />
      <TotalRow>
        <span>{t("total", "Total:")}</span>
        <strong>{(totalPrice ?? 0).toFixed(2)} EUR</strong>
      </TotalRow>
      <Actions>
        <ShowDetailBtn onClick={() => setShowDetail((v) => !v)}>
          {showDetail
            ? t("hideDetails", "Hide Details")
            : t("showDetails", "Show Details")}
        </ShowDetailBtn>
      </Actions>
      {showDetail && <OrderDetail order={order} />}
    </Card>
  );
};

export default OrderCard;

// --- Styled Components ---
const Card = styled.div`
  background: ${({ theme }) => theme.colors.white || "#fff"};
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 1.5px 4px #0001;
  padding: 2.2rem 2rem 1.5rem;
  margin-bottom: 0.3rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.2rem;
  margin-bottom: 0.1rem;
  flex-wrap: wrap;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15em;
`;

const OrderNumber = styled.div`
  font-size: 1.09rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.primary || "#1b2536"};
`;

const Status = styled.span<{ $status: string }>`
  background: ${({ $status, theme }) =>
    $status === "delivered"
      ? theme.colors.success || "#13ae60"
      : $status === "cancelled"
      ? theme.colors.danger || "#f44336"
      : theme.colors.secondary || "#374151"};
  color: #fff;
  padding: 0.22em 1.2em;
  border-radius: 16px;
  font-size: 1em;
  font-weight: 500;
  text-transform: capitalize;
  margin-left: 0.6rem;
  min-width: 85px;
  text-align: center;
  align-self: flex-start;
`;

const DateSpan = styled.span`
  color: ${({ theme }) => theme.colors.grey || "#8c8c8c"};
  font-size: 0.97em;
  margin-top: 2px;
`;

const BuyerName = styled.div`
  color: ${({ theme }) => theme.colors.primary || "#183153"};
  font-size: 1.07em;
  font-weight: 500;
  margin-bottom: 0.45em;
  margin-top: 0.1em;
  letter-spacing: 0.01em;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  font-size: 1.08rem;
  margin-top: 1.3rem;
  font-weight: 600;
`;

const Actions = styled.div`
  margin-top: 1.1rem;
  display: flex;
  justify-content: flex-end;
`;

const ShowDetailBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary || "#0a0a0a"};
  color: #fff;
  border-radius: 25px;
  padding: 0.55em 1.6em;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 4px #0001;
  transition: background 0.17s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary || "#222"};
  }
`;
