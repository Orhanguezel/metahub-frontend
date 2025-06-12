"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBikes, clearBikeMessages } from "@/modules/bikes/slice/bikeSlice";
import { useTranslation } from "react-i18next";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import AddToCartButton from "@/shared/AddToCartButton"; // <-- güncel yolu kullan

import type { SupportedLocale } from "@/types/common";

export default function BikePage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("bike");

  // Aktif dili al
  const lang = (i18n.language?.split("-")[0] as SupportedLocale) || "en";
  const { bikes, loading, error } = useAppSelector((state) => state.bike);

  useEffect(() => {
    dispatch(fetchBikes(lang));
    return () => {
      dispatch(clearBikeMessages());
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
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }

  if (!bikes || bikes.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noBike", "Ürün bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allBike", "Tüm Ürünler")}</PageTitle>
      <BikeGrid>
        {bikes.map((item, index) => (
          <BikeCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <ImageWrapper>
              <img
                src={item.images?.[0]?.url}
                alt={item.name?.[lang] || "Bike"}
                loading="lazy"
              />
            </ImageWrapper>
            <CardContent>
              <h2>{item.name?.[lang] || "-"}</h2>
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
              <ReadMore href={`/bikes/${item.slug}`}>
                {t("page.readMore", "Detayları Gör →")}
              </ReadMore>
              {/* ---- AddToCartButton --- */}
              <AddToCartButton
                productId={item._id}
                disabled={item.stock < 1}
              />
            </CardContent>
          </BikeCard>
        ))}
      </BikeGrid>
    </PageWrapper>
  );
}

// Styled Components aynı kalabilir
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

const BikeGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const BikeCard = styled(motion.div)`
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
    background: #f2f2f2;
    display: block;
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
