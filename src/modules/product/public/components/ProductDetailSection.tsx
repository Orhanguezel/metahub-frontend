"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import "react-image-lightbox/style.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRadonarProdBySlug,
  fetchRadonarProd,
  clearRadonarProdMessages,
} from "@/modules/product/slice/radonarprodSlice";
import { addToCart, clearCartMessages } from "@/modules/cart/slice/cartSlice";

import { Skeleton, ErrorMessage } from "@/shared";
import { CommentForm, CommentList } from "@/modules/comment";
import { ShoppingCart } from "lucide-react";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function ProductDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useTranslation("product");
  const { t: tCart } = useTranslation("cart");
  const dispatch = useAppDispatch();

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const {
    selected: product,
    radonarprod: allProducts,
    loading,
    error,
  } = useAppSelector((state) => state.radonarprod);

  const {
    loading: cartLoading,
    error: cartError,
    successMessage,
    stockWarning,
    cart,
  } = useAppSelector((state) => state.cart);

  const [added, setAdded] = useState(false);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchRadonarProdBySlug(slug));
      dispatch(fetchRadonarProd(lang));
    }
    return () => {
      dispatch(clearRadonarProdMessages());
      dispatch(clearCartMessages());
    };
  }, [dispatch, slug, lang]);

  useEffect(() => {
    if (successMessage) {
      setAdded(true);
      const timeout = setTimeout(() => {
        setAdded(false);
        dispatch(clearCartMessages());
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    setMainPhoto(0); // Ürün değiştiğinde ana foto sıfırlansın
  }, [product?._id]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const isInCart =
  cart?.items?.some(
    (ci) =>
      typeof ci.product === "object" &&
      ci.product !== null &&
      "_id" in ci.product &&
      ci.product._id === product._id
  ) || false;


  const otherProducts = allProducts
    ?.filter((item) => item.slug !== slug)
    .slice(0, 2);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{product.name?.[lang]}</Title>

      {product.images?.length > 0 && (
        <>
          <MainImageWrapper>
            <MainImage
              src={product.images[mainPhoto].url}
              alt={`product-image-${mainPhoto}`}
              onClick={() => setIsOpen(true)}
              tabIndex={0}
              role="button"
              aria-label="Büyüt"
            />
          </MainImageWrapper>
          <Thumbnails>
            {product.images.map((img, idx) => (
              <ThumbWrapper
                key={idx}
                $active={mainPhoto === idx}
                onClick={() => setMainPhoto(idx)}
                tabIndex={0}
                aria-label={`Küçük resim ${idx + 1}`}
              >
                <Thumb src={img.url} alt={`thumb-${idx}`} />
              </ThumbWrapper>
            ))}
          </Thumbnails>
        </>
      )}

      <Description>{product.description?.[lang]}</Description>

      <MetaInfo>
        <MetaItem>🏷 {t("page.brand", "Marka")}: {product.brand}</MetaItem>
        <MetaItem>💰 {t("page.price", "Fiyat")}: {product.price} €</MetaItem>
        <MetaItem>📦 {t("page.stock", "Stok")}: {product.stock}</MetaItem>
        {product.isElectric && <MetaItem>⚡ Electric Bike</MetaItem>}
        {product.color?.length ? (
          <MetaItem>🎨 {t("page.color", "Renk")}: {product.color.join(", ")}</MetaItem>
        ) : null}
        {product.tags?.length ? (
          <Tags>
            {product.tags.map((tag, i) => (
              <Tag key={i}>#{tag}</Tag>
            ))}
          </Tags>
        ) : null}
      </MetaInfo>

      <AddCartButton
        disabled={cartLoading || product.stock < 1 || isInCart}
        onClick={() => {
          dispatch(addToCart({ productId: product._id, quantity: 1 }));
        }}
        aria-label={tCart("add", "Sepete Ekle")}
      >
        <ShoppingCart size={22} style={{ marginRight: 8, marginBottom: -3 }} />
        <span>
          {product.stock < 1
            ? tCart("outOfStock", "Stok Yok")
            : cartLoading
            ? tCart("adding", "Ekleniyor…")
            : isInCart
            ? tCart("inCart", "Sepette")
            : tCart("add", "Sepete Ekle")}
        </span>
      </AddCartButton>
      {successMessage && added && (
        <CartSuccessMsg>{tCart("success", "Sepete eklendi!")}</CartSuccessMsg>
      )}
      {stockWarning && (
        <StockWarningMsg>{stockWarning}</StockWarningMsg>
      )}
      {cartError && (
        <CartErrorMsg>{tCart("error", "Sepete eklenemedi!")}</CartErrorMsg>
      )}

      {isOpen && product.images?.length > 0 && (
        <Lightbox
          mainSrc={product.images[mainPhoto].url}
          nextSrc={product.images[(mainPhoto + 1) % product.images.length].url}
          prevSrc={
            product.images[
              (mainPhoto + product.images.length - 1) % product.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setMainPhoto(
              (mainPhoto + product.images.length - 1) % product.images.length
            )
          }
          onMoveNextRequest={() =>
            setMainPhoto((mainPhoto + 1) % product.images.length)
          }
          imageCaption={product.name?.[lang]}
        />
      )}

      {otherProducts?.length > 0 && (
        <OtherProduct>
          <h3>{t("page.other", "Diğer Ürünler")}</h3>
          <ProductList>
            {otherProducts.map((item) => (
              <ProductItem key={item._id}>
                <Link href={`/product/${item.slug}`}>{item.name?.[lang]}</Link>
              </ProductItem>
            ))}
          </ProductList>
        </OtherProduct>
      )}

      <CommentForm contentId={product._id} contentType="radonarprod" />
      <CommentList contentId={product._id} contentType="radonarprod" />
    </Container>
  );
}

// --- Styled Components ---

const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const MainImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MainImage = styled.img`
  width: 420px;
  max-width: 98vw;
  height: 320px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: zoom-in;
  background: ${({ theme }) => theme.colors.backgroundAlt || "#1a1a1a"};

  @media (max-width: 600px) {
    width: 100%;
    height: 180px;
  }
`;

const Thumbnails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const ThumbWrapper = styled.div<{ $active: boolean }>`
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : "transparent"};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme, $active }) =>
    $active ? theme.shadows.md : "none"};
  padding: 2px;
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.8)};
  transition: border 0.2s, box-shadow 0.2s, opacity 0.2s;
`;

const Thumb = styled.img`
  width: 72px;
  height: 52px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt || "#1a1a1a"};
  @media (max-width: 600px) {
    width: 48px;
    height: 36px;
  }
`;

const Description = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MetaInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground || "#eee"};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
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
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

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

const OtherProduct = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const ProductList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ProductItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
