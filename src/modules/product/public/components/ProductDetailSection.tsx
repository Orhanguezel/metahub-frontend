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

import {
  Skeleton,
  ErrorMessage
 } from "@/shared";
import {
  CommentForm,
  CommentList,
 } from "@/modules/comment";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function ProductDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useTranslation("product");
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

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchRadonarProdBySlug(slug));
      dispatch(fetchRadonarProd(lang));
    }

    return () => {
      dispatch(clearRadonarProdMessages());
    };
  }, [dispatch, slug, lang]);

  const otherProducts = allProducts
    ?.filter((item) => item.slug !== slug)
    .slice(0, 2);

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

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{product.name?.[lang]}</Title>

      {product.images?.length > 0 && (
        <Gallery>
          {product.images.map((img, idx) => (
            <ImageWrapper
              key={idx}
              onClick={() => {
                setPhotoIndex(idx);
                setIsOpen(true);
              }}
            >
              <img src={img.url} alt={`product-image-${idx}`} />
            </ImageWrapper>
          ))}
        </Gallery>
      )}

      <Description>{product.description?.[lang]}</Description>

      <MetaInfo>
        <MetaItem>🏷 Brand: {product.brand}</MetaItem>
        <MetaItem>💰 Price: {product.price} €</MetaItem>
        <MetaItem>📦 Stock: {product.stock}</MetaItem>
        {product.isElectric && <MetaItem>⚡ Electric Bike</MetaItem>}
        {product.color?.length ? (
          <MetaItem>🎨 Color: {product.color.join(", ")}</MetaItem>
        ) : null}
        {product.tags?.length ? (
          <Tags>
            {product.tags.map((tag, i) => (
              <Tag key={i}>#{tag}</Tag>
            ))}
          </Tags>
        ) : null}
      </MetaInfo>

      {isOpen && product.images?.length > 0 && (
        <Lightbox
          mainSrc={product.images[photoIndex].url}
          nextSrc={product.images[(photoIndex + 1) % product.images.length].url}
          prevSrc={
            product.images[
              (photoIndex + product.images.length - 1) % product.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + product.images.length - 1) % product.images.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % product.images.length)
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

// Styled Components
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ImageWrapper = styled.div`
  flex: 1 1 280px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  &:hover {
    transform: scale(1.02);
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

const OtherProduct = styled.div`
  margin-top: ${({ theme }) => theme.spacing["2xl"]};
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
