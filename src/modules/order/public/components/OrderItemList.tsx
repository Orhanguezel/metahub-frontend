"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import type { IOrderItem } from "@/modules/order/types";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";
import { getLocalized } from "@/shared/getLocalized";

interface OrderItemListProps {
  items?: IOrderItem[];
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
        const product = item.product as IBikes | IEnsotekprod | ISparepart | undefined;

        // Ürün adı
        let name = "";
        if (product && typeof product === "object" && "name" in product) {
          name =
            typeof product.name === "object"
              ? getLocalized(product.name, lang)
              : String(product.name);
        } else {
          name = (item as any).name || t("detail.unnamedProduct", "Unnamed product");
        }

        // Fiyat (siparişteki fiyat öncelikli)
        const price =
          typeof item.priceAtAddition === "number"
            ? item.priceAtAddition
            : typeof item.unitPrice === "number"
            ? item.unitPrice
            : 0;

        return (
          <Item key={typeof item.product === "object" ? (item.product as any)._id : String(item.product) || idx}>
            <Left>
              <ProductName title={name}>{name}</ProductName>
              {/* Buraya ürünle ilgili ekstra info veya badge eklenebilir */}
            </Left>
            <Right>
              <Qty>
                {item.quantity} <span>×</span>
              </Qty>
              <Price>{price.toFixed(2)}</Price>
              <Currency>EUR</Currency>
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
  gap: 0.8rem;
  margin-top: 0.3rem;
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: left;
  padding: 0.55em 0 0.9em 0;
  opacity: 0.85;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0.85rem 0.35rem 0.7rem 0.35rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background 0.2s;
  min-width: 0;
  gap: 0.9em;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.primaryTransparent};
  }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.6em;
    align-items: stretch;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: 0.6rem 0.15rem 0.6rem 0.15rem;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65em;
  min-width: 0;
  flex: 1;
`;

const ProductName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.06em;
  letter-spacing: 0.01em;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 500px) {
    max-width: 95vw;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.32em;
  min-width: 120px;
  justify-content: flex-end;
`;

const Qty = styled.span`
  color: ${({ theme }) => theme.colors.darkGrey};
  font-weight: 500;
  font-size: 1.01em;
  span {
    margin: 0 0.16em;
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 700;
  }
`;

const Price = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.09em;
  margin-left: 0.14em;
`;

const Currency = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.98em;
  margin-left: 0.12em;
`;

