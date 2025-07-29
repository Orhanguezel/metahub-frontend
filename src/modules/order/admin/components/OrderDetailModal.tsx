"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import { OrderItemList } from "@/modules/order";
import type { IOrder, OrderStatus } from "@/modules/order/types";

interface OrderDetailModalProps {
  order: IOrder;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
}) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  if (!order) return null;

  // Kullanıcı tipini handle et (string veya object)
  const userId =
    typeof order.user === "string"
      ? order.user
      : order.user && typeof order.user === "object" && "_id" in order.user
      ? order.user._id
      : "-";

  const userName =
    order.user && typeof order.user === "object" && "name" in order.user
      ? order.user.name
      : undefined;

  const userEmail =
    order.user && typeof order.user === "object" && "email" in order.user
      ? order.user.email
      : undefined;

  return (
    <Backdrop tabIndex={-1} onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>
            {t("detail.title", "Order Detail")} #
            {(order._id || (order as any).id)?.toString().slice(-6)}
          </Title>
          <CloseBtn onClick={onClose} aria-label={t("close", "Close")}>
            ×
          </CloseBtn>
        </Header>
        <Section>
          <Label>{t("orderId", "Order ID")}:</Label> <Mono>{order._id || (order as any).id}</Mono>
        </Section>
        <Section>
          <Label>{t("createdAt", "Created At")}:</Label>{" "}
          <span>
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
          </span>
        </Section>
        <Section>
          <Label>{t("userId", "User ID")}:</Label> <Mono>{userId}</Mono>
        </Section>
        {userName && (
          <Section>
            <Label>{t("userName", "User Name")}:</Label> <Mono>{userName}</Mono>
          </Section>
        )}
        {userEmail && (
          <Section>
            <Label>{t("userEmail", "Email")}:</Label> <Mono>{userEmail}</Mono>
          </Section>
        )}
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
                  ? order.shippingAddress.name[lang] || Object.values(order.shippingAddress.name)[0]
                  : order.shippingAddress.name}
              </div>
            )}
            {order.shippingAddress?.phone && (
              <div>
                <strong>{t("phone", "Phone")}:</strong> {order.shippingAddress.phone}
              </div>
            )}
            <div>
              <strong>{t("address", "Address")}:</strong>{" "}
              {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.country]
                .filter(Boolean)
                .join(", ")}
            </div>
            {order.shippingAddress?.postalCode && (
              <div>
                <strong>{t("postalCode", "Postal Code")}:</strong> {order.shippingAddress.postalCode}
              </div>
            )}
          </AddressBlock>
        </Section>
        <Section>
          <Label>{t("paymentMethod", "Payment Method")}:</Label> <Mono>{order.paymentMethod}</Mono>
        </Section>
        <Section>
          <Label>{t("total", "Total")}:</Label>{" "}
          <Total>{order.totalPrice?.toFixed(2) || "0.00"} EUR</Total>
        </Section>
        <Section>
          <Label>{t("productDetails", "Product Details")}:</Label>
          <OrderItemList items={order.items} lang={lang} />
        </Section>
      </Modal>
    </Backdrop>
  );
};

export default OrderDetailModal;

// --- Styled Components ---
const Backdrop = styled.div`
  position: fixed;
  z-index: 200;
  inset: 0;
  background: rgba(30, 35, 48, 0.17);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 3vw 0;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.card || "#fff"};
  border-radius: 22px;
  max-width: 510px;
  width: 98vw;
  margin: 5vh auto;
  padding: 2.2rem 2rem 2rem 2rem;
  box-shadow: 0 6px 38px #0017;
  position: relative;
  animation: modalPop 0.22s cubic-bezier(0.29, 0.95, 0.61, 1.1);

  @media (max-width: 600px) {
    padding: 1.1rem 0.5rem 1.6rem 0.7rem;
    max-width: 99vw;
    border-radius: 13px;
  }

  @keyframes modalPop {
    0% {
      opacity: 0;
      transform: translateY(60px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.35rem;
`;

const Title = styled.h2`
  font-size: 1.53rem;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: ${({ theme }) => theme.colors.text || "#18181c"};
`;

const CloseBtn = styled.button`
  font-size: 2.15rem;
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 0 6px;
  margin-left: 8px;
  transition: color 0.15s;
  line-height: 1;
  &:hover,
  &:focus {
    color: #e00;
  }
`;

const Section = styled.div`
  margin-bottom: 1.05rem;
  font-size: 1.07rem;
  @media (max-width: 600px) {
    font-size: 1em;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary || "#293141"};
  margin-right: 0.55em;
  letter-spacing: 0.01em;
`;

const Status = styled.span<{ $status: OrderStatus }>`
  background: ${({ $status, theme }) =>
    $status === "delivered"
      ? theme.colors.success || "#13ae60"
      : $status === "cancelled"
      ? theme.colors.danger || "#e74c3c"
      : $status === "pending"
      ? theme.colors.warning || "#FF9800"
      : theme.colors.secondary || "#374151"};
  color: #fff;
  padding: 0.19em 1.18em;
  border-radius: 16px;
  font-size: 1em;
  font-weight: 500;
  text-transform: capitalize;
  margin-left: 0.58rem;
  min-width: 80px;
  text-align: center;
  display: inline-block;
`;

const Mono = styled.span`
  font-family: "JetBrains Mono", "Fira Mono", monospace;
  background: #f3f6fa;
  border-radius: 6px;
  padding: 2px 9px;
  font-size: 0.97em;
  letter-spacing: 0.6px;
`;

const Total = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success || "#16b76a"};
  font-size: 1.09em;
  letter-spacing: 0.07em;
  background: #f8faf4;
  border-radius: 7px;
  padding: 2px 12px;
  margin-left: 6px;
`;

const AddressBlock = styled.div`
  margin-top: 0.18em;
  font-size: 0.97em;
  color: #353535;
  line-height: 1.45;
  border-left: 3.5px solid #f4f4f4;
  padding-left: 10px;
  > div {
    margin-bottom: 0.22em;
  }
`;
