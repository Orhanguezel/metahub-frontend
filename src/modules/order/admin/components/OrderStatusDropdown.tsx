"use client";
import React from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateOrderStatusAdmin } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { IOrder, OrderStatus } from "@/modules/order/types";

export const ORDER_STATUSES: OrderStatus[] = ["pending","preparing","shipped","completed","cancelled","delivered"];

type Props = { order: IOrder };

const OrderStatusDropdown: React.FC<Props> = ({ order }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("order", translations);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus !== order.status && order._id) {
      dispatch(updateOrderStatusAdmin({ id: order._id, status: newStatus }));
    }
  };

  return (
    <StatusSelect value={order.status} onChange={handleChange} aria-label={t("status", "Status")}>
      {ORDER_STATUSES.map((stat) => (
        <option value={stat} key={stat}>
          {t(`status.${stat}`, stat)}
        </option>
      ))}
    </StatusSelect>
  );
};

export default OrderStatusDropdown;

/* styled — form input patern */
const StatusSelect = styled.select`
  min-width: 130px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  &:focus,&:hover{ border-color:${({theme})=>theme.colors.primary}; }
`;
