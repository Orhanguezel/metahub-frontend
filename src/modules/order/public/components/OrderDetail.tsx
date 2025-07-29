"use client";
import React from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import styled from "styled-components";
import type { OrderStatus, IOrderItem, IOrder } from "@/modules/order/types";

interface OrderDetailProps {
  order: IOrder;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  if (!order) return null;

  // Kullanıcı diline göre ürün açıklamaları
  const productDescription = order.items.map(
    (item: IOrderItem) => (item.product as any)?.description?.[lang] ?? "-"
  );

  return (
    <Container>
      <Section>
        <DetailTitle>{t("detail.title", "Sipariş Detayı")}</DetailTitle>
        <Row>
          <Label>{t("orderId", "Sipariş No")}</Label>
          <Value>{order._id}</Value>
        </Row>
        <Row>
          <Label>{t("createdAt", "Oluşturulma")}</Label>
          <Value>
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
          </Value>
        </Row>
        <Row>
          <Label>{t("status", "Sipariş Durumu")}</Label>
          <OrderStatusBadge $status={order.status}>
            {t(`status.${order.status}`, order.status)}
          </OrderStatusBadge>
        </Row>
      </Section>

      <Section>
        <SubTitle>{t("productDetails", "Ürünler")}</SubTitle>
        {order.items.map((item: IOrderItem, index: number) => (
          <ProductBlock key={index}>
            <div>
              <strong>{(item.product as any)?.name?.[lang] ?? "-"}</strong>
              <ProductDesc>
                {t("productDescription", "Açıklama")}: {productDescription[index]}
              </ProductDesc>
            </div>
            <ProductDetails>
              <span>
                {t("quantity", "Adet")}: <b>{item.quantity}</b>
              </span>
              <span>
                {t("unitPrice", "Birim Fiyat")}:{" "}
                <b>{item.unitPrice?.toFixed(2)} €</b>
              </span>
            </ProductDetails>
          </ProductBlock>
        ))}
      </Section>

      <Section>
        <SubTitle>{t("total", "Toplam Fiyat")}</SubTitle>
        <TotalPrice>{(order.totalPrice ?? 0).toFixed(2)} €</TotalPrice>
      </Section>

      <Section>
        <SubTitle>{t("shippingAddress", "Teslimat Adresi")}</SubTitle>
        <AddressTable>
          <tbody>
            <tr>
              <td>{t("name", "Alıcı")}</td>
              <td>{order.shippingAddress?.name}</td>
            </tr>
            <tr>
              <td>{t("phone", "Telefon")}</td>
              <td>{order.shippingAddress?.phone}</td>
            </tr>
            <tr>
              <td>{t("address", "Adres")}</td>
              <td>
                {order.shippingAddress?.street}
                , {order.shippingAddress?.city}{" "}
                {order.shippingAddress?.postalCode && (
                  <>({order.shippingAddress?.postalCode})</>
                )}
                , {order.shippingAddress?.country}
              </td>
            </tr>
          </tbody>
        </AddressTable>
      </Section>

      <Section>
        <SubTitle>{t("paymentMethod", "Ödeme Yöntemi")}</SubTitle>
        <Value>{t(`payment_${order.paymentMethod}`, order.paymentMethod)}</Value>
      </Section>
    </Container>
  );
};

export default OrderDetail;

// --- Styled Components ---

const Container = styled.div`
  max-width: 750px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.3rem;
  @media (max-width: 800px) {
    padding: 1.5rem 0.7rem 1.3rem;
  }
`;

const Section = styled.section`
  margin-bottom: 0.2rem;
`;

const DetailTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800;
  margin-bottom: 1.1rem;
  letter-spacing: -0.5px;
`;

const SubTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600;
  margin-bottom: 0.9rem;
  letter-spacing: -0.2px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.38em;
  gap: 1.2em;
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.3em;
    align-items: flex-start;
  }
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 120px;
  font-weight: 500;
`;

const Value = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
`;

const OrderStatusBadge = styled.div<{ $status: OrderStatus }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  padding: 0.32em 1.35em;
  border-radius: 2em;
  color: #fff;
  background: ${({ $status }) =>
    $status === "completed"
      ? "linear-gradient(90deg, #28C76F 30%, #1E9A5B 100%)"
      : $status === "pending"
      ? "linear-gradient(90deg, #FFC107 40%, #E0A800 100%)"
      : $status === "delivered"
      ? "linear-gradient(90deg, #2875c2 0%, #0bb6d6 100%)"
      : $status === "cancelled"
      ? "linear-gradient(90deg, #FF6B6B 30%, #E53935 100%)"
      : "linear-gradient(90deg, #688EB3 0%, #23405B 100%)"};
  text-shadow: 0 2px 8px #2221;
  display: inline-block;
  min-width: 110px;
  text-align: center;
  letter-spacing: 0.04em;
  border: none;
`;

const ProductBlock = styled.div`
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: 1.1em 1.3em 1.1em 1.1em;
  margin-bottom: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 0.65em;
  @media (max-width: 600px) {
    padding: 0.8em 0.7em;
  }
`;

const ProductDesc = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  margin-top: 0.14em;
`;

const ProductDetails = styled.div`
  display: flex;
  gap: 2.3em;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.4em;
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.2em;
  }
`;

const TotalPrice = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.success};
  font-weight: 700;
  margin-top: 0.35em;
`;

const AddressTable = styled.table`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: transparent;
  border-collapse: collapse;
  td {
    padding: 0.32em 0.7em 0.32em 0;
    border: none;
    color: ${({ theme }) => theme.colors.text};
    &:first-child {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.textMuted};
      min-width: 80px;
    }
  }
`;

