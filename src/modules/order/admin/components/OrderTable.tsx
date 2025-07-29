"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import { OrderStatusDropdown } from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

// Props tipi
interface OrderTableProps {
  orders: IOrder[];
  onShowDetail: (order: IOrder) => void;
  onDelete: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders = [],
  onShowDetail,
  onDelete,
}) => {
  const { t,i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale; 

  if (!orders.length)
    return <Empty>{t("admin.noOrders", "No orders found.")}</Empty>;

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <th>{t("orderNumber", "Order #")}</th>
            <th>{t("createdAt", "Date")}</th>
            <th>{t("customer", "Customer")}</th>
            <th>{t("total", "Total")}</th>
            <th>{t("status", "Status")}</th>
            <th>{t("actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id || (order as any).id}>
              <OrderIdTd>
                <OrderId>
                  #{(order._id || (order as any).id)?.toString().slice(-6)}
                </OrderId>
              </OrderIdTd>
              <td>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "-"}
              </td>
              <td>
                {order.shippingAddress?.name
                  ? typeof order.shippingAddress.name === "object"
                    ? order.shippingAddress.name[lang] ||
                      Object.values(order.shippingAddress.name)[0]
                    : order.shippingAddress.name
                  : "-"}
              </td>
              <td>
                <Price>
                  {(order.totalPrice ?? 0).toFixed(2)} <Currency>EUR</Currency>
                </Price>
              </td>
              <td>
                <OrderStatusDropdown order={order} />
              </td>
              <td>
                <ActionBtn onClick={() => onShowDetail(order)}>
                  {t("detail", "Detail")}
                </ActionBtn>
                <DeleteBtn
                  onClick={() => onDelete(order._id || (order as any).id)}
                >
                  {t("delete", "Delete")}
                </DeleteBtn>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default OrderTable;

// --- Styled Components ---
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(20, 28, 58, 0.07);

  @media (max-width: 800px) {
    border-radius: 7px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 660px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.card || "#fff"};
  border-radius: 16px;
  overflow: hidden;

  th,
  td {
    padding: 1.05rem 0.65rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#e0e3e6"};
    font-size: 1.04em;
    white-space: nowrap;
  }

  th {
    background: ${({ theme }) => theme.colors.backgroundSecondary || "#f8fafc"};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary || "#444"};
    border-top: none;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }

  /* ----- MOBILE RESPONSIVE STYLE ----- */
  @media (max-width: 650px) {
    min-width: unset;
    border-radius: 8px;
    th {
      display: none;
    }
    tbody,
    tr,
    td {
      display: block;
      width: 100%;
    }
    tr {
      margin-bottom: 1.3rem;
      box-shadow: 0 2px 14px rgba(20, 28, 58, 0.06);
      background: ${({ theme }) => theme.colors.background || "#f7f8fa"};
      border-radius: 12px;
      padding: 0.3em 0.5em 1em 0.5em;
    }
    td {
      border: none;
      position: relative;
      padding: 0.6em 0.8em 0.45em 2em;
      font-size: 0.97em;
      &:before {
        content: attr(data-label);
        position: absolute;
        left: 0.7em;
        top: 0.63em;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.textMuted || "#aaa"};
        font-size: 0.91em;
        letter-spacing: 0.01em;
      }
    }
  }
`;

const OrderIdTd = styled.td`
  font-family: "JetBrains Mono", "Fira Mono", monospace;
  letter-spacing: 1.3px;
  background: transparent;
  @media (max-width: 650px) {
    padding-top: 1.1em;
  }
`;

const OrderId = styled.span`
  background: ${({ theme }) => theme.colors.backgroundSecondary || "#f3f7fc"};
  color: ${({ theme }) => theme.colors.primary || "#1677ff"};
  padding: 2.5px 13px 2.5px 9px;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1em;
`;

const Price = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success || "#3caf74"};
  font-size: 1em;
  letter-spacing: 0.2px;
`;

const Currency = styled.span`
  font-size: 0.93em;
  font-weight: 400;
  margin-left: 2px;
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
`;

const ActionBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary || "#183153"};
  color: #fff;
  border: none;
  padding: 0.42em 1.13em;
  margin-right: 0.5em;
  border-radius: 14px;
  font-size: 0.97em;
  cursor: pointer;
  transition: background 0.14s;
  font-weight: 500;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#253962"};
  }
  &:active {
    background: ${({ theme }) => theme.colors.primaryDark || "#0f2547"};
  }
`;

const DeleteBtn = styled(ActionBtn)`
  background: ${({ theme }) => theme.colors.danger || "#d32f2f"};
  &:hover,
  &:focus {
    background: #b71c1c;
  }
`;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.grey || "#888"};
  padding: 2.2rem 0 1.7rem 0;
  font-size: 1.12em;
`;
