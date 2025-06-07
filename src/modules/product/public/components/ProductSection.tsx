"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRadonarProd } from "@/modules/product/slice/radonarprodSlice";
import { addToCart, clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { Skeleton, ErrorMessage } from "@/shared";

// Eğer lucide-react kuruluysa:
import { ShoppingCart } from "lucide-react"; // veya istediğin ikon kütüphanesinden

export default function RadonarProdSection() {
  const { t, i18n } = useTranslation("product");
  const { t: tCart } = useTranslation("cart");
  const dispatch = useAppDispatch();
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

  const [addedId, setAddedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchRadonarProd(lang));
    return () => {
      dispatch(clearCartMessages());
    };
  }, [dispatch, lang]);

  if (!mounted) return null;

  const latestradonarprod = radonarprod.slice(0, 3);

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
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>
        <IconTitle>📰</IconTitle>
        {t("page.radonarprod.title")}
      </Title>

      {loading && (
        <Grid>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Grid>
      )}

      {!loading && error && <ErrorMessage />}

      {!loading && !error && (
        <>
          <Grid>
            {latestradonarprod.map((item, index) => (
              <CardWrapper key={item._id}>
                <CardLink href={`/product/${item.slug}`} passHref>
                  <Card
                    as={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Content>
                      <BlogTitle>{item.name?.[lang]}</BlogTitle>
                      <Excerpt>{item.description?.[lang]}</Excerpt>
                    </Content>
                    {item.images?.[0]?.url && (
                      <StyledImage
                        src={item.images[0].url}
                        alt={item.name?.[lang]}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                      />
                    )}
                  </Card>
                </CardLink>
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
                  aria-label={tCart("add", "Sepete Ekle")}
                >
                  <ShoppingCart size={20} style={{ marginRight: 8, marginBottom: -3 }} />
                  <span>
                    {item.stock < 1
                      ? tCart("outOfStock", "Stok Yok")
                      : cartLoading && addedId === item._id
                      ? tCart("adding", "Ekleniyor…")
                      : isInCart(item._id)
                      ? tCart("inCart", "Sepette")
                      : tCart("add", "Sepete Ekle")}
                  </span>
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
              </CardWrapper>
            ))}
          </Grid>
          <SeeAll href="/product">{t("page.radonarprod.all")}</SeeAll>
        </>
      )}
    </Section>
  );
}

// 💅 Styled Components

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const IconTitle = styled.span`
  font-size: 1.6em;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing["xl"]};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 400px;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px) scale(1.025);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const Content = styled.div`
  text-align: left;
  width: 100%;
`;

const BlogTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledImage = styled(motion.img)`
  width: 220px;
  height: 160px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: cover;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s;
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  &:hover {
    transform: scale(1.03);
  }
  @media (max-width: 767px) {
    width: 100%;
    height: 160px;
  }
`;

const AddCartButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px) scale(1.01);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(0.2);
  }
`;

const CartSuccessMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.success || "green"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const StockWarningMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.warning || "orange"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const CartErrorMsg = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.danger || "red"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
