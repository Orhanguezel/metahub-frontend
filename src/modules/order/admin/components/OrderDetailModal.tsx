"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import { OrderItemList } from "@/modules/order";
import type { IOrder, OrderStatus } from "@/modules/order/types";

interface OrderDetailModalProps { order: IOrder; onClose: () => void; }

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  if (!order) return null;

  const userId =
    typeof order.user === "string"
      ? order.user
      : order.user && typeof order.user === "object" && "_id" in order.user
      ? (order.user as any)._id
      : "-";

  const userName =
    order.user && typeof order.user === "object" && "name" in order.user
      ? (order.user as any).name
      : undefined;

  const userEmail =
    order.user && typeof order.user === "object" && "email" in order.user
      ? (order.user as any).email
      : undefined;

  return (
    <Backdrop tabIndex={-1} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {t("detail.title", "Order Detail")} #{(order._id || (order as any).id)?.toString().slice(-6)}
          </Title>
          <CloseBtn onClick={onClose} aria-label={t("close", "Close")}>×</CloseBtn>
        </Header>

        <Section><Label>{t("orderId", "Order ID")}:</Label> <Mono>{order._id || (order as any).id}</Mono></Section>
        <Section><Label>{t("createdAt", "Created At")}:</Label> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</Section>
        <Section><Label>{t("userId", "User ID")}:</Label> <Mono>{userId}</Mono></Section>
        {userName && <Section><Label>{t("userName", "User Name")}:</Label> <Mono>{userName}</Mono></Section>}
        {userEmail && <Section><Label>{t("userEmail", "Email")}:</Label> <Mono>{userEmail}</Mono></Section>}
        <Section>
          <Label>{t("status", "Status")}:</Label>{" "}
          <Status $status={order.status}>{t(`status.${order.status}`, order.status)}</Status>
        </Section>

        <Section>
          <Label>{t("shippingAddress", "Shipping Address")}:</Label>
          <AddressBlock>
            {order.shippingAddress?.name && (
              <div>
                <strong>{t("name", "Name")}:</strong>{" "}
                {typeof order.shippingAddress.name === "object"
                  ? (order.shippingAddress.name as any)[lang] || Object.values(order.shippingAddress.name as any)[0]
                  : order.shippingAddress.name}
              </div>
            )}
            {order.shippingAddress?.phone && (
              <div><strong>{t("phone", "Phone")}:</strong> {order.shippingAddress.phone}</div>
            )}
            <div>
              <strong>{t("address", "Address")}:</strong>{" "}
              {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.country].filter(Boolean).join(", ")}
            </div>
            {order.shippingAddress?.postalCode && (
              <div><strong>{t("postalCode", "Postal Code")}:</strong> {order.shippingAddress.postalCode}</div>
            )}
          </AddressBlock>
        </Section>

        <Section><Label>{t("paymentMethod", "Payment Method")}:</Label> <Mono>{order.paymentMethod}</Mono></Section>
        <Section><Label>{t("total", "Total")}:</Label> <Total>{(order.totalPrice ?? 0).toFixed(2)} EUR</Total></Section>

        <Section>
          <Label>{t("productDetails", "Product Details")}:</Label>
          <OrderItemList items={order.items} lang={lang} />
        </Section>
      </Modal>
    </Backdrop>
  );
};

export default OrderDetailModal;

/* styled (modal patern) */
const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 200;
  background: rgba(30, 35, 48, 0.17);
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; padding: 3vw 0;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  max-width: 560px; width: 98vw; margin: 5vh auto;
  padding: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Header = styled.div`display:flex; justify-content:space-between; align-items:start; margin-bottom:${({theme})=>theme.spacings.md};`;

const Title = styled.h2`margin:0; color:${({theme})=>theme.colors.title};`;

const CloseBtn = styled.button`
  font-size: 1.8rem; background: none; border: none; color: ${({theme})=>theme.colors.textSecondary}; cursor: pointer;
  line-height: 1; padding: 0 6px;
  &:hover,&:focus{ color: ${({theme})=>theme.colors.danger}; }
`;

const Section = styled.div`margin-bottom:${({theme})=>theme.spacings.sm}; font-size:${({theme})=>theme.fontSizes.sm};`;
const Label = styled.span`font-weight:600; color:${({theme})=>theme.colors.textSecondary}; margin-right:.55em;`;

const Status = styled.span<{ $status: OrderStatus }>`
  padding: .2em .8em; border-radius: ${({theme})=>theme.radii.pill};
  color: #fff;
  background: ${({ $status, theme }) =>
    $status === "delivered" ? (theme.colors.success || "#13ae60") :
    $status === "cancelled" ? (theme.colors.danger || "#e74c3c") :
    $status === "pending" ? (theme.colors.warning || "#FF9800") :
    (theme.colors.secondary || "#374151")};
  text-transform: capitalize;
`;

const Mono = styled.span`
  font-family: ${({theme})=>theme.fonts.mono};
  background: ${({theme})=>theme.colors.backgroundAlt};
  border-radius: ${({theme})=>theme.radii.sm};
  padding: 2px 9px;
`;

const Total = styled.span`
  font-weight:700; color:${({theme})=>theme.colors.success}; background:${({theme})=>theme.colors.successBg};
  padding: 2px 10px; border-radius:${({theme})=>theme.radii.sm};
`;

const AddressBlock = styled.div`
  margin-top: 4px; font-size: .95em; line-height: 1.45;
  border-left: 3px solid ${({theme})=>theme.colors.borderBright};
  padding-left: 10px;
  > div { margin-bottom: 2px; }
`;
