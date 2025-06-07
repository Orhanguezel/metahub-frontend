"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRadonarProd,
  clearRadonarProdMessages,
} from "@/modules/product/slice/radonarprodSlice";
import { addToCart, clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { useTranslation } from "react-i18next";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("product");
  const { t: tCart } = useTranslation("cart");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { radonarprod, loading, error } = useAppSelector(
    (state) => state.radonarprod
  );
  const {
    loading: cartLoading,
    error: cartError,
    successMessage,
    stockWarning,
    cart,
  } = useAppSelector((state) => state.cart);

  // Hangi ürün sepete eklendi? (Feedback göstermek için)
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRadonarProd(lang));
    return () => {
      dispatch(clearRadonarProdMessages());
      dispatch(clearCartMessages());
    };
  }, [dispatch, lang]);

  if (loading) {
    return (
      <PageWrapper>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage />
      </PageWrapper>
    );
  }

  if (!radonarprod || radonarprod.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noProduct", "Ürün bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  // Sepette ürün var mı, kontrol (opsiyonel)
  const isInCart = (id: string) =>
  cart?.items?.some((ci) => {
    // ci.product obje mi ve _id'si var mı kontrol et
    return (
      typeof ci.product === "object" &&
      ci.product !== null &&
      "_id" in ci.product &&
      (ci.product as { _id: string })._id === id
    );
  }) || false;

  return (
    <PageWrapper>
      <PageTitle>{t("page.allProduct", "Tüm Ürünler")}</PageTitle>

      <ProductGrid>
        {radonarprod.map((item, index) => (
          <ProductCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img src={item.images[0].url} alt={item.name?.[lang]} />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{item.name?.[lang] || "No name"}</h2>
              <p>{item.description?.[lang] || "-"}</p>
              <Meta>
                <span>
                  {t("page.price", "Fiyat")}: {item.price} €
                </span>
                <span>
                  {t("page.stock", "Stok")}: {item.stock}
                </span>
                <span>
                  {t("page.brand", "Marka")}: {item.brand}
                </span>
              </Meta>
              <ReadMore href={`/product/${item.slug}`}>
                {t("page.readMore", "Detayları Gör →")}
              </ReadMore>
              <AddCartButton
                disabled={
                  cartLoading && addedId === item._id ||
                  item.stock < 1 ||
                  isInCart(item._id)
                }
                onClick={() => {
                  dispatch(addToCart({ productId: item._id, quantity: 1 }));
                  setAddedId(item._id);
                  setTimeout(() => dispatch(clearCartMessages()), 2000);
                }}
              >
                {item.stock < 1
                  ? tCart("outOfStock", "Stok Yok")
                  : cartLoading && addedId === item._id
                  ? tCart("adding", "Ekleniyor…")
                  : isInCart(item._id)
                  ? tCart("inCart", "Sepette")
                  : tCart("add", "Sepete Ekle")}
              </AddCartButton>
              {successMessage && addedId === item._id && (
                <CartSuccessMsg>{tCart("success", "Sepete eklendi!")}</CartSuccessMsg>
              )}
              {stockWarning && addedId === item._id && (
                <StockWarningMsg>{stockWarning}</StockWarningMsg>
              )}
              {cartError && addedId === item._id && (
                <CartErrorMsg>{tCart("error", "Sepete eklenemedi!")}</CartErrorMsg>
              )}
            </CardContent>
          </ProductCard>
        ))}
      </ProductGrid>
    </PageWrapper>
  );
}

// Styled Components

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const ProductGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const ProductCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ImageWrapper = styled.div`
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ReadMore = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const AddCartButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.sm};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CartSuccessMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.success || "green"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StockWarningMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.warning || "orange"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CartErrorMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.danger || "red"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
