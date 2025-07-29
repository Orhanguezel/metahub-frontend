"use client";
import React from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateOrderStatusAdmin } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { IOrder, OrderStatus } from "@/modules/order/types";

// Statusler union'dan
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
  "delivered",
];

type OrderStatusDropdownProps = {
  order: IOrder;
};

const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({ order }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("order", translations);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus !== order.status && order._id) {
      dispatch(updateOrderStatusAdmin({ id: order._id, status: newStatus }));
    }
  };

  return (
    <StatusSelect
      value={order.status}
      onChange={handleChange}
      aria-label={t("status", "Status")}
    >
      {ORDER_STATUSES.map((stat) => (
        <option value={stat} key={stat}>
          {t(`status.${stat}`, stat)}
        </option>
      ))}
    </StatusSelect>
  );
};

export default OrderStatusDropdown;

// Styled component - responsive & theme uyumlu
const StatusSelect = styled.select`
  min-width: 118px;
  max-width: 170px;
  padding: 0.34em 1.2em 0.34em 0.7em;
  border-radius: 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.border || "#c0c0c0"};
  background: ${({ theme }) => theme.colors.inputBackground || "#fafafc"};
  color: ${({ theme }) => theme.colors.text || "#222"};
  font-weight: 600;
  font-size: 1em;
  transition: border 0.16s, box-shadow 0.18s;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 6px #0001;

  &:focus,
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary || "#2875c2"};
    box-shadow: 0 2px 13px #00a0ff18;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabledBg || "#f2f2f2"};
    color: ${({ theme }) => theme.colors.disabled || "#aaa"};
    cursor: not-allowed;
    border-color: #eee;
  }

  option {
    background: #fff;
    color: #181819;
    font-weight: 500;
    font-size: 1em;
  }

  @media (max-width: 650px) {
    min-width: 78px;
    max-width: 120px;
    font-size: 0.96em;
    padding: 0.21em 0.4em 0.21em 0.5em;
    border-radius: 10px;
  }
`;
