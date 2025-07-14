"use client";
import React from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateOrderStatusAdmin } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
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
    if (newStatus !== order.status) {
      // Sadece _id gönder
      if (order._id) {
        dispatch(updateOrderStatusAdmin({ id: order._id, status: newStatus }));
      }
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
          {t(stat, stat)}
        </option>
      ))}
    </StatusSelect>
  );
};

export default OrderStatusDropdown;

// Styled component aynı

const StatusSelect = styled.select`
  min-width: 128px;
  padding: 0.38em 1.3em 0.38em 1em;
  border-radius: 16px;
  border: 1.5px solid ${({ theme }) => theme.colors.grey || "#c0c0c0"};
  background: ${({ theme }) => theme.colors.backgroundSecondary || "#fafafc"};
  color: ${({ theme }) => theme.colors.text || "#222"};
  font-weight: 600;
  font-size: 1.07em;
  transition: border 0.17s, box-shadow 0.17s;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1.5px 8px #0001;

  &:focus,
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary || "#3aaed9"};
    box-shadow: 0 2px 11px #00a0ff15;
  }

  &:disabled {
    background: #f2f2f2;
    color: #aaa;
    cursor: not-allowed;
    border-color: #eee;
  }

  option {
    background: #fff;
    color: #191919;
    font-weight: 500;
    font-size: 1em;
  }

  @media (max-width: 650px) {
    min-width: 90px;
    font-size: 0.96em;
    padding: 0.28em 0.7em 0.28em 0.7em;
  }
`;
