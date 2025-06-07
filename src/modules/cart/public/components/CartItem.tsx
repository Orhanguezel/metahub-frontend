import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks"; // <-- Doğru dispatch tipi
import { increaseQuantity, decreaseQuantity, removeFromCart } from "@/modules/cart/slice/cartSlice";
import { X } from "lucide-react";
import type { ICartItem } from "@/modules/cart/types";
import { useTranslation } from "react-i18next";

interface Props {
  item: ICartItem;
}

export default function CartItem({ item }: Props) {
  const dispatch = useAppDispatch(); // useDispatch yerine useAppDispatch
  const { t } = useTranslation("cart");
  const prod = item.product as any;

  // Eğer prod._id yoksa fallback
  const prodId = prod?._id || prod?.id || "";

  return (
    <ItemCard>
      <Image src={prod.images?.[0]?.thumbnail || "/no-image.png"} alt={prod.name?.en || ""} />
      <Info>
        <Name>
          {prod.name?.en || prod.name?.tr || prod.name?.de || t("cart.noName", "Unnamed")}
        </Name>
        <Price>
          {prod.price} €
          <QuantityControls>
            <button
              onClick={() => dispatch(decreaseQuantity(prodId))}
              aria-label={t("cart.decrease", "-")}
              disabled={item.quantity < 2}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => dispatch(increaseQuantity(prodId))}
              aria-label={t("cart.increase", "+")}
            >
              +
            </button>
          </QuantityControls>
        </Price>
        <RemoveBtn
          onClick={() => dispatch(removeFromCart(prodId))}
          title={t("cart.remove", "Remove")}
        >
          <X size={18} />
        </RemoveBtn>
      </Info>
    </ItemCard>
  );
}

// Styled Components (değişmedi)
const ItemCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;
const Image = styled.img`
  width: 90px;
  height: 70px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const Name = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
`;
const Price = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  margin: 8px 0 0 0;
`;
const QuantityControls = styled.span`
  margin-left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  button {
    width: 24px;
    height: 24px;
    border: none;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    font-weight: 600;
    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger || "red"};
  cursor: pointer;
  margin-top: 5px;
  align-self: flex-end;
  transition: color 0.15s;
  &:hover {
    color: #900;
  }
`;
