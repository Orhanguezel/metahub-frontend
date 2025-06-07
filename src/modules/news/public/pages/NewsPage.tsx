"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNews, clearNewsMessages } from "@/modules/news/slice/newsSlice";
import { useTranslation } from "react-i18next";
import {
  Skeleton,
  ErrorMessage
 } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NewsPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("news");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { news, loading, error } = useAppSelector((state) => state.news);

  useEffect(() => {
    dispatch(fetchNews(lang));
    return () => {
      dispatch(clearNewsMessages());
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

  if (!news || news.length === 0) {
    return (
      <PageWrapper>
        <p>{t("noNews", "Haber bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("allNews", "Tüm Haberler")}</PageTitle>

      <NewsGrid>
        {news.map((item, index) => (
          <NewsCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img src={item.images[0].url} alt={item.title?.[lang]} />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{item.title?.[lang] || "Untitled"}</h2>
              <p>{item.summary?.[lang] || "No summary available."}</p>
              <Meta>
                <span>
                  {t("author", "Yazar")}:{" "}
                  {item.author || t("unknown", "Bilinmiyor")}
                </span>
                <span>
                  {t("tags", "Etiketler")}: {item.tags?.join(", ") || "-"}
                </span>
              </Meta>
              <ReadMore href={`/news/${item.slug}`}>
                {t("readMore", "Devamını Oku →")}
              </ReadMore>
            </CardContent>
          </NewsCard>
        ))}
      </NewsGrid>
    </PageWrapper>
  );
}

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

const NewsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const NewsCard = styled(motion.div)`
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
