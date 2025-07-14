"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import type { OrderItemType, ProductType } from "@/modules/order/types";
import { getLocalized } from "@/shared/getLocalized";

interface OrderItemListProps {
  items?: OrderItemType[]; // optional, array olmayabilir!
  lang?: SupportedLocale;
}

const OrderItemList: React.FC<OrderItemListProps> = ({
  items = [],
  lang: customLang,
}) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (customLang || i18n.language?.slice(0, 2)) as SupportedLocale;

  if (!Array.isArray(items) || items.length === 0)
    return <Empty>{t("detail.noItems", "No items in order")}</Empty>;

  return (
    <Items>
      {items.map((item, idx) => {
        // product olabilir, string olabilir (id), boş olabilir
        let product: ProductType = {};
        if (typeof item.product === "object" && item.product !== null) {
          product = item.product;
        }
        // string ise (ör: id), isim fallback'e düşecek

        // İsim: Çoklu dil varsa, öncelik ver. Yoksa item.name
        const name =
          product.name && typeof product.name === "object"
            ? getLocalized(product.name, lang)
            : item.name || t("detail.unnamedProduct", "Unnamed product");

        // Fiyat: Öncelik priceAtAddition (siparişteki fiyat), sonra ürün fiyatı
        const price =
          typeof item.priceAtAddition === "number"
            ? item.priceAtAddition
            : typeof product.price === "number"
            ? product.price
            : 0;

        return (
          <Item key={product._id || String(item.product) || idx}>
            <Left>
              <ProductName>{name}</ProductName>
              {item.size && <Size>({item.size})</Size>}
            </Left>
            <Right>
              <Qty>
                {item.quantity} × <Price>{price.toFixed(2)}</Price>
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
