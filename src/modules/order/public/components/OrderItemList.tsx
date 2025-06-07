import React from "react";
import styled from "styled-components";
import type { OrderItem } from "@/modules/order/types";
import { useTranslation } from "react-i18next";

interface Props {
  items: OrderItem[];
}



export default function OrderItemList({ items }: Props) {
  const { t, i18n } = useTranslation("order");

  // Yardımcı: Ürün adını dilden bulur
  function getProductName(product: OrderItem["product"]): string {
    if (!product) return "";
    // Sadece string ise (ID)
    if (typeof product === "string") return product;

    // product.name hem string hem obje olabiliyor
    if (typeof product.name === "string") return product.name;

    // product.name obje ise (çok dilli)
    if (typeof product.name === "object") {
      const lang = i18n.language || "en";
      return (
        product.name[lang as "en" | "tr" | "de"] ||
        product.name.en ||
        product.name.tr ||
        product.name.de ||
        ""
      );
    }
    return "";
  }

  if (!items?.length)
    return <div>{t("order.noItems", "No items in this order.")}</div>;

  return (
    <div>
      {items.map((item, idx) => (
        <ProductRow key={idx}>
          <span>{getProductName(item.product)}</span>
          <span>x{item.quantity}</span>
          <span>€{item.unitPrice?.toFixed(2)}</span>
        </ProductRow>
      ))}
    </div>
  );
}



const ProductRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
