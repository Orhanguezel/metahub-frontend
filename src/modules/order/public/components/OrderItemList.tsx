"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import type { IOrderItem} from "@/modules/order/types";
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
          // Çoklu dil desteği varsa
          name =
            typeof product.name === "object"
              ? getLocalized(product.name, lang)
              : String(product.name);
        } else {
          // String ise veya bilinmiyorsa
          name = (item as any).name || t("detail.unnamedProduct", "Unnamed product");
        }

        // Fiyat (siparişteki fiyat her zaman öncelik)
        const price =
          typeof item.priceAtAddition === "number"
            ? item.priceAtAddition
            : typeof item.unitPrice === "number"
            ? item.unitPrice
            : 0;

        return (
          <Item key={typeof item.product === "object" ? (item.product as any)._id : String(item.product) || idx}>
            <Left>
              <ProductName>{name}</ProductName>
              {/* Eğer ürünün başka bilgileri varsa burada gösterebilirsin */}
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

// --- Styled Components (aynı kalabilir) ---
const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.6rem;
`;
// ... diğer styled'lar aynı şekilde devam

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.grey || "#aaa"};
  font-size: 1.04em;
  text-align: left;
  padding: 0.5em 0 0.7em 0;
  opacity: 0.9;
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