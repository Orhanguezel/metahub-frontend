"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { OrderStatus, IOrderItem, IOrder } from "@/modules/order/types";

interface OrderDetailProps {
  order: IOrder;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  const { t, i18n } = useTranslation("order");
  if (!order) return null;

  // Kullanıcı diline göre ürün açıklamaları
  const lang = i18n.language || "en";
  const productDescription = order.items.map(
    (item: IOrderItem) => (item.product as any)?.description?.[lang] ?? "-"
  );

  return (
    <Container>
      <h1>{t("detail.title", "Order Detail")}</h1>

      {/* Order ID ve User Bilgisi */}
      <SectionTitle>{t("orderInfo", "Order Information")}</SectionTitle>
      <Details>
        <DetailItem>
          <strong>{t("orderId", "Order ID")}: </strong> {order._id}
        </DetailItem>
        <DetailItem>
          <strong>{t("user", "User")}: </strong> {String(order.user)}
        </DetailItem>
        <DetailItem>
          <strong>{t("createdAt", "Created At")}: </strong>{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
        </DetailItem>
      </Details>

      {/* Product Details */}
      <SectionTitle>{t("productDetails", "Product Details")}</SectionTitle>
      {order.items.map((item: IOrderItem, index: number) => (
        <ProductDetails key={index}>
          <DetailItem>
            <strong>{t("productName", "Product Name")}: </strong>{" "}
            {(item.product as any)?.name?.[lang] ?? "-"}
          </DetailItem>
          <DetailItem>
            <strong>{t("productDescription", "Description")}: </strong>{" "}
            {productDescription[index]}
          </DetailItem>
          <DetailItem>
            <strong>{t("quantity", "Quantity")}: </strong> {item.quantity}
          </DetailItem>
          <DetailItem>
            <strong>{t("unitPrice", "Unit Price")}: </strong> {item.unitPrice}{" "}
            EUR
          </DetailItem>
        </ProductDetails>
      ))}

      {/* Total Price */}
      <SectionTitle>{t("total", "Total Price")}</SectionTitle>
      <TotalPrice>{order.totalPrice} EUR</TotalPrice>

      {/* Shipping Address */}
      <SectionTitle>{t("shippingAddress", "Shipping Address")}</SectionTitle>
      <Details>
        <DetailItem>
          <strong>{t("name", "Name")}: </strong> {order.shippingAddress?.name}
        </DetailItem>
        <DetailItem>
          <strong>{t("phone", "Phone")}: </strong>{" "}
          {order.shippingAddress?.phone}
        </DetailItem>
        <DetailItem>
          <strong>{t("address", "Address")}: </strong>
          {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.country}
        </DetailItem>
        <DetailItem>
          <strong>{t("postalCode", "Postal Code")}: </strong>{" "}
          {order.shippingAddress?.postalCode}
        </DetailItem>
      </Details>

      {/* Payment Method */}
      <SectionTitle>{t("paymentMethod", "Payment Method")}</SectionTitle>
      <Details>
        <DetailItem>
          <strong>{t("method", "Method")}: </strong> {order.paymentMethod}
        </DetailItem>
      </Details>

      {/* Status */}
      <SectionTitle>{t("status", "Order Status")}</SectionTitle>
      <Status $status={order.status}>{order.status}</Status>
    </Container>
  );
};

export default OrderDetail;

// --- Styled Components ---
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-top: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
`;

const Details = styled.div`
  margin-top: 10px;
`;

const DetailItem = styled.div`
  margin: 8px 0;
  font-size: 1rem;
  color: #555;
`;

const ProductDetails = styled.div`
  margin-top: 15px;
  padding-left: 20px;
`;

const TotalPrice = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: #1d7d1d;
  margin-top: 15px;
`;

const Status = styled.div<{ $status: OrderStatus }>`
  font-size: 1.2rem;
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  background-color: ${({ $status }) =>
    $status === "completed"
      ? "#4CAF50"
      : $status === "pending"
      ? "#FF9800"
      : $status === "shipped"
      ? "#2196F3"
      : $status === "preparing"
      ? "#9C27B0"
      : $status === "cancelled"
      ? "#F44336"
      : "#8d8d8d"};
  text-align: center;
  margin-top: 15px;
`;
