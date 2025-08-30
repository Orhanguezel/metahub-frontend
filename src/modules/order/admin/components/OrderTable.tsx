"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import { OrderStatusDropdown } from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

interface OrderTableProps {
  orders: IOrder[];
  onShowDetail: (order: IOrder) => void;
  onDelete: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders = [], onShowDetail, onDelete }) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  if (!orders.length) return <Empty>{t("admin.noOrders", "No orders found.")}</Empty>;

  return (
    <TableWrap>
      <Table>
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
          {orders.map((order) => {
            const oid = order._id || (order as any).id;
            const customer =
              order.shippingAddress?.name
                ? typeof order.shippingAddress.name === "object"
                  ? (order.shippingAddress.name as any)[lang] || Object.values(order.shippingAddress.name as any)[0]
                  : order.shippingAddress.name
                : "-";
            const currency = (order.currency || "EUR").toUpperCase();
            const total = Number(order.finalTotal || 0);
            return (
              <tr key={oid}>
                <OrderIdTd data-label={t("orderNumber", "Order #")}>
                  <OrderId>#{oid?.toString().slice(-6)}</OrderId>
                </OrderIdTd>
                <td data-label={t("createdAt", "Date")}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                </td>
                <td data-label={t("customer", "Customer")}>{customer}</td>
                <td data-label={t("total", "Total")}>
                  <Price>
                    {total.toFixed(2)} <Currency>{currency}</Currency>
                  </Price>
                </td>
                <td data-label={t("status", "Status")}><OrderStatusDropdown order={order} /></td>
                <td data-label={t("actions", "Actions")}>
                  <ActionBtn onClick={() => onShowDetail(order)}>{t("detail", "Detail")}</ActionBtn>
                  <DeleteBtn onClick={() => onDelete(oid)}>{t("delete", "Delete")}</DeleteBtn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrap>
  );
};

export default OrderTable;

/* styled — About/Ensotek list patern */
const TableWrap = styled.div`
  width:100%; overflow-x:auto; border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  background:${({theme})=>theme.colors.cardBackground};
`;

const Table = styled.table`
  width:100%; border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md}; text-align:left; white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm}; vertical-align:middle;
  }
  tbody tr:hover td{ background:${({theme})=>theme.colors.hoverBackground}; }
  @media (max-width: 650px){
    thead { display:none; }
    tbody, tr, td { display:block; width:100%; }
    tr{
      margin-bottom:${({theme})=>theme.spacings.sm};
      border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
      border-radius:${({theme})=>theme.radii.md};
      background:${({theme})=>theme.colors.background};
    }
    td{
      border:none; position:relative; padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.xs} ${({theme})=>theme.spacings.xl};
      &:before{
        content: attr(data-label);
        position:absolute; left:${({theme})=>theme.spacings.sm}; top:${({theme})=>theme.spacings.sm};
        font-weight:600; color:${({theme})=>theme.colors.textSecondary};
        font-size:${({theme})=>theme.fontSizes.xsmall};
      }
    }
  }
`;

const OrderIdTd = styled.td`
  font-family:${({theme})=>theme.fonts.mono};
  letter-spacing: 1px;
`;

const OrderId = styled.span`
  background:${({theme})=>theme.colors.backgroundAlt};
  color:${({theme})=>theme.colors.primary};
  padding: 2px 10px;
  border-radius:${({theme})=>theme.radii.sm};
  font-weight:600;
`;

const Price = styled.span`
  font-weight:700; color:${({theme})=>theme.colors.success};
`;

const Currency = styled.span`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  margin-left: 2px;
`;

const ActionBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md};
  font-size:${({theme})=>theme.fontSizes.sm}; cursor:pointer; margin-right:6px;
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

const DeleteBtn = styled(ActionBtn)`
  background:${({ theme }) => theme.colors.dangerBg};
  color:${({ theme }) => theme.colors.danger};
  border-color:${({ theme }) => theme.colors.danger};
  &:hover{
    background:${({ theme }) => theme.colors.dangerHover};
    color:${({ theme }) => theme.colors.textOnDanger};
  }
`;

const Empty = styled.div`
  text-align:center; color:${({theme})=>theme.colors.textSecondary};
  padding:${({theme})=>theme.spacings.lg} 0;
`;
