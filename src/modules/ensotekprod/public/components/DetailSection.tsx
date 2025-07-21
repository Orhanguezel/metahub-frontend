"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import {translations} from "@/modules/ensotekprod";
import translations2 from "@/modules/cart/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import type { SupportedLocale } from "@/types/common";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEnsotekprodBySlug,
  setSelectedEnsotekprod,
  clearEnsotekprodMessages,
} from "@/modules/ensotekprod/slice/ensotekprodSlice";
import { clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { Skeleton, ErrorMessage, AddToCartButton } from "@/shared";
import { CommentForm, CommentList } from "@/modules/comment";
import { ShoppingCart } from "lucide-react";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function EnsotekprodDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
      const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { t: tCart } = useI18nNamespace("cart", translations2);
  const dispatch = useAppDispatch();

  const {
    selected: ensotekprod,
    ensotekprod: allProducts,
    loading,
    error,
  } = useAppSelector((state) => state.ensotekprod);

  // Galeri state
  const [mainPhoto, setMainPhoto] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 1️⃣ — Öncelik: Store’dan seç, gerekirse fetch et
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const found = allProducts.find((item:IEnsotekprod) => item.slug === slug);
      if (found) {
        dispatch(setSelectedEnsotekprod(found));
      } else {
        dispatch(fetchEnsotekprodBySlug(slug));
      }
    } else {
      dispatch(fetchEnsotekprodBySlug(slug));
    }
    // Temizlik (cart mesajı vs.)
    return () => {
      dispatch(clearEnsotekprodMessages());
      dispatch(clearCartMessages());
    };
  }, [dispatch, allProducts, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !ensotekprod) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherProducts = allProducts
    ?.filter((item: IEnsotekprod) => item.slug !== slug)
    .slice(0, 2);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{ensotekprod.name?.[lang]}</Title>

      {ensotekprod.images?.length > 0 && (
        <>
          <MainImageWrapper>
            <MainImage
              src={ensotekprod.images[mainPhoto].url}
              alt={`ensotekprod-image-${mainPhoto}`}
              onClick={() => setIsOpen(true)}
              tabIndex={0}
              role="button"
              aria-label={t("detail.openImage", "Büyüt")}
            />
          </MainImageWrapper>
          <Thumbnails>
            {ensotekprod.images.map((img: IEnsotekprod["images"][number], idx: number) => (
              <ThumbWrapper
                key={idx}
                $active={mainPhoto === idx}
                onClick={() => setMainPhoto(idx)}
                tabIndex={0}
                aria-label={t("detail.thumb", `Küçük resim ${idx + 1}`)}
              >
                <Thumb src={img.url} alt={`thumb-${idx}`} />
              </ThumbWrapper>
            ))}
          </Thumbnails>
        </>
      )}

      <Description>{ensotekprod.description?.[lang]}</Description>
      <MetaInfo>
        <MetaItem>
          🏷 {t("page.brand", "Marka")}: {ensotekprod.brand}
        </MetaItem>
        <MetaItem>
          💰 {t("page.price", "Fiyat")}: {ensotekprod.price} €
        </MetaItem>
        <MetaItem>
          📦 {t("page.stock", "Stok")}: {ensotekprod.stock}
        </MetaItem>
        {ensotekprod.isElectric && (
          <MetaItem>⚡ {t("page.electric", "Elektrikli")}</MetaItem>
        )}
        {ensotekprod.color?.length ? (
          <MetaItem>
            🎨 {t("page.color", "Renk")}: {ensotekprod.color.join(", ")}
          </MetaItem>
        ) : null}
      {ensotekprod.tags?.length ? (
  <Tags>
    {ensotekprod.tags.map((tag: string, i: number) => (
      <Tag key={i}>#{tag}</Tag>
    ))}
  </Tags>
) : null}



      </MetaInfo>

      <AddToCartButton productId={ensotekprod._id} disabled={ensotekprod.stock < 1}>
        <ShoppingCart size={22} style={{ marginRight: 8, marginBottom: -3 }} />
        <span>
          {ensotekprod.stock < 1
            ? tCart("outOfStock", "Stok Yok")
            : tCart("add", "Sepete Ekle")}
        </span>
      </AddToCartButton>

      {isOpen && ensotekprod.images?.length > 0 && (
        <Lightbox
          mainSrc={ensotekprod.images[mainPhoto].url}
          nextSrc={ensotekprod.images[(mainPhoto + 1) % ensotekprod.images.length].url}
          prevSrc={
            ensotekprod.images[
              (mainPhoto + ensotekprod.images.length - 1) % ensotekprod.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setMainPhoto(
              (mainPhoto + ensotekprod.images.length - 1) % ensotekprod.images.length
            )
          }
          onMoveNextRequest={() =>
            setMainPhoto((mainPhoto + 1) % ensotekprod.images.length)
          }
          imageCaption={ensotekprod.name?.[lang]}
        />
      )}

      {otherProducts?.length > 0 && (
        <OtherProduct>
          <h3>{t("page.other", "Diğer Ürünler")}</h3>
          <ProductList>
            {otherProducts.map((item: IEnsotekprod) => (
              <ProductItem key={item._id}>
                <Link href={`/ensotekprod/${item.slug}`}>{item.name?.[lang]}</Link>
              </ProductItem>
            ))}
          </ProductList>
        </OtherProduct>
      )}

      <CommentForm contentId={ensotekprod._id} contentType="ensotekprod" />
      <CommentList contentId={ensotekprod._id} contentType="ensotekprod" />
    </Container>
  );
}

const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const MainImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
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
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const ThumbWrapper = styled.div<{ $active: boolean }>`
  border: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadows.md : "none")};
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
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const MetaInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
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
  gap: ${({ theme }) => theme.spacings.xs};
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
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const ProductList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
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
