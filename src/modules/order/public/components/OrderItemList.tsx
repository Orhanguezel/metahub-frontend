"use client";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { getLocalized } from "@/shared/getLocalized";

// Order item ve product tiplerin burada veya dış dosyada olmalı
interface ProductNameType {
  [lang: string]: string;
}

interface ProductType {
  _id?: string;
  name?: ProductNameType;
  price?: number;
  [key: string]: any;
}

interface OrderItemType {
  product?: ProductType | string;
  name?: string;
  quantity: number;
  priceAtAddition?: number;
  size?: string;
}

interface OrderItemListProps {
  items: OrderItemType[];
  lang?: string;
}

const OrderItemList: React.FC<OrderItemListProps> = ({
  items,
  lang: customLang,
}) => {
  const { i18n, t } = useTranslation("order");
  const lang = customLang || i18n.language || "en";

  if (!items?.length)
    return <Empty>{t("detail.noItems", "No items in order")}</Empty>;

  return (
    <Items>
      {items.map((item, idx) => {
        // Hem Object hem string olabilir (id olabilir)
        const product =
          typeof item.product === "object" && item.product ? item.product : {};
        return (
          <Item key={(product._id as string) || String(item.product) || idx}>
            <Left>
              <ProductName>
                {product.name ? getLocalized(product.name, lang) : item.name}
              </ProductName>
              {item.size && <Size>({item.size})</Size>}
            </Left>
            <Right>
              <Qty>
                {item.quantity} ×{" "}
                <Price>
                  {typeof item.priceAtAddition === "number"
                    ? item.priceAtAddition.toFixed(2)
                    : typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : "0.00"}
                </Price>
                <Currency>EUR</Currency>
              </Qty>
            </Right>
          </Item>
        );
      })}
    </Items>
  );
};

export default OrderItemList;

// --- Styled Components ---
const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.6rem;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1rem 0.2rem;
  font-size: 1.07em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey || "#f1f1f1"};

  &:last-child {
    border-bottom: none;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65em;
  min-width: 0;
`;

const ProductName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.black || "#1b1b1b"};
  font-size: 1.05em;
  letter-spacing: 0.01em;
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Size = styled.span`
  color: ${({ theme }) => theme.colors.primary || "#253962"};
  font-size: 0.96em;
  font-weight: 400;
  opacity: 0.95;
  margin-left: 2px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35em;
`;

const Qty = styled.span`
  color: ${({ theme }) => theme.colors.black || "#232323"};
  font-weight: 500;
  font-size: 1.03em;
`;

const Price = styled.span`
  color: ${({ theme }) => theme.colors.primary || "#183153"};
  font-weight: 500;
  font-size: 1.04em;
  margin-left: 0.12em;
`;

const Currency = styled.span`
  color: ${({ theme }) => theme.colors.grey || "#999"};
  font-size: 0.98em;
  margin-left: 0.1em;
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.grey || "#aaa"};
  font-size: 1.04em;
  text-align: left;
  padding: 0.5em 0 0.7em 0;
  opacity: 0.9;
`;
