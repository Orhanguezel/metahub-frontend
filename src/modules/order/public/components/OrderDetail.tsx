"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getOrderById,
  clearOrderMessages,
} from "@/modules/order/slice/ordersSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Message } from "@/shared";
import OrderItemList from "@/modules/order/public/components/OrderItemList";

export default function OrderDetail() {
  const dispatch = useAppDispatch();
  const params = useParams<{ id: string }>();
  const { order, loading, error } = useAppSelector((s) => s.orders);
  const { t } = useTranslation("order");

  useEffect(() => {
    if (params.id) dispatch(getOrderById(params.id));
    return () => {
      dispatch(clearOrderMessages());
    };
  }, [dispatch, params.id]);

  if (loading) return <Message>{t("order.loading", "Loading...")}</Message>;
  if (error) return <Message $error>{error}</Message>;
  if (!order)
    return <Message>{t("order.notfound", "Order not found.")}</Message>;

  return (
    <DetailWrapper>
      <Header>
        <OrderId>
          {t("order.number", "Order #")} {order._id?.slice(-6)}
        </OrderId>
        <Status status={order.status}>
          {t(
            `order.status.${order.status || "undefined"}`,
            order.status ? order.status : t("order.status.undefined", "Unknown")
          )}
        </Status>
      </Header>

      <Section>
        <b>{t("order.date", "Order Date")}:</b>{" "}
        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
      </Section>

      <Section>
        <b>{t("order.total", "Total Price")}:</b> €
        {order.totalPrice?.toFixed(2)}
      </Section>

      <Section>
        <b>{t("order.shippingAddress", "Shipping Address")}:</b>
        <AddressBlock>
          {order.shippingAddress?.name} <br />
          {order.shippingAddress?.street}, {order.shippingAddress?.city}{" "}
          {order.shippingAddress?.postalCode} <br />
          {order.shippingAddress?.country} <br />
          {order.shippingAddress?.phone} <br />
          {order.shippingAddress?.email}
        </AddressBlock>
      </Section>

      <Section>
        <b>{t("order.items", "Ordered Items")}:</b>
        <OrderItemList items={order.items} />
      </Section>
    </DetailWrapper>
  );
}

// Styled Components
const DetailWrapper = styled.div`
  max-width: 600px;
  margin: 48px auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const OrderId = styled.span`
  font-size: 1.14rem;
  font-weight: 600;
`;

const Status = styled.span<{ status?: string }>`
  font-weight: 700;
  color: ${({ status, theme }) =>
    status === "completed"
      ? theme.colors.success
      : status === "pending"
      ? theme.colors.warning
      : theme.colors.textSecondary};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 1.05rem;
`;

const AddressBlock = styled.div`
  padding-left: 6px;
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.97rem;
`;
