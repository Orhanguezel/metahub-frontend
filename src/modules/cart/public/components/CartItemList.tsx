"use client";
import styled from "styled-components";
import Link from "next/link";
import type { ICartItem } from "@/modules/cart/types";
import type { IBikes } from "@/modules/bikes/types";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { getMultiLang } from "@/types/common";

// --- Type guard: gerçek obje mi? ---
function isPopulatedProduct(
  product: unknown
): product is IBikes | IEnsotekprod | ISparepart {
  return (
    !!product &&
    typeof product === "object" &&
    "_id" in product &&
    "name" in product
  );
}

// --- Ürün tipi -> label ve slug base ---
const PRODUCT_TYPE_LABEL: Record<string, string> = {
  bike: "Bisiklet",
  ensotekprod: "Ensotek Ürün",
  sparepart: "Yedek Parça",
};
const PRODUCT_TYPE_SLUG: Record<string, string> = {
  bike: "/bikes/",
  ensotekprod: "/ensotekprod/",
  sparepart: "/sparepart/",
};

interface Props {
  items: ICartItem[];
}

export default function CartItemList({ items }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as any; // ex: 'tr', 'en'

  return (
    <ListContainer>
      {items.map((item) => {
        const { productType } = item;
        const productId: string =
          isPopulatedProduct(item.product)
            ? String(item.product._id)
            : String(item.product);

        let productName = "-";
        let productSlug = "#";
        let productImage = "";

        if (isPopulatedProduct(item.product)) {
          productName = getMultiLang((item.product as any).name, lang);

          // 🔥 Slug ve route tamamen ürün tipine göre (future-proof!)
          const slugBase = PRODUCT_TYPE_SLUG[productType] || "/";
          productSlug =
            (slugBase && (item.product as any).slug)
              ? `${slugBase}${(item.product as any).slug}`
              : "#";
          productImage = (item.product as any).images?.[0]?.url || "";
        }

        return (
          <CartItemRow key={productId + "-" + productType}>
            <ThumbBox>
              {productImage ? (
                <Image
                  src={productImage}
                  alt={typeof productName === "string" ? productName : "-"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="60px"
                  priority={false}
                />
              ) : (
                <ImgPlaceholder />
              )}
            </ThumbBox>
            <Details>
              <ProductName as={Link} href={productSlug}>
                {productName}
              </ProductName>
              <ProductType>
                {PRODUCT_TYPE_LABEL[productType] || productType}
              </ProductType>
              <Qty>
                <span>Miktar:</span> <b>{item.quantity}</b>
              </Qty>
            </Details>
            <Price>
              <span>
                {item.priceAtAddition.toFixed(2)} €
                {item.quantity > 1 && (
                  <small style={{ color: "#999", marginLeft: 4 }}>
                    x{item.quantity}
                  </small>
                )}
              </span>
              <Total>
                <b>
                  {(item.quantity * item.priceAtAddition).toFixed(2)} €
                </b>
              </Total>
            </Price>
          </CartItemRow>
        );
      })}
    </ListContainer>
  );
}

// --- Styles ---
// (Aynen bırakabilirsin)
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

const CartItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 18px 12px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const ThumbBox = styled.div`
  width: 60px;
  min-width: 60px;
  height: 38px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.skeleton};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #e0e5ec;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.2rem;
`;

const Details = styled.div`
  flex: 1;
  min-width: 120px;
`;

const ProductName = styled(Link)`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const ProductType = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  margin-bottom: 2px;
`;

const Qty = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  span { font-weight: 400; }
`;

const Price = styled.div`
  min-width: 90px;
  text-align: right;
  span {
    display: block;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Total = styled.div`
  font-size: 1.12rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;
