import styled from "styled-components";
import { CartItem } from "@/modules/cart";
import type { ICartItem } from "@/modules/cart/types";
//import { useTranslation } from "react-i18next";

interface Props {
  items: ICartItem[];
}

export default function CartItemList({ items }: Props) {
  return (
    <ListContainer>
      {items.map((item) => {
        // 1. Eğer product bir obje ve _id alanı varsa
        let key: string;
        if (typeof item.product === "string") {
          key = item.product;
        } else if (
          item.product &&
          typeof item.product === "object" &&
          "_id" in item.product
        ) {
          key =
            (item.product as any)._id?.toString?.() ||
            JSON.stringify(item.product);
        } else {
          key = JSON.stringify(item.product);
        }
        return <CartItem key={key} item={item} />;
      })}
    </ListContainer>
  );
}

const ListContainer = styled.div`
  flex: 2;
  min-width: 340px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
