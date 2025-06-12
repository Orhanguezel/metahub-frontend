"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchArticles,
  clearArticlesMessages,
} from "@/modules/articles/slice/articlesSlice";
import { useTranslation } from "react-i18next";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { getCurrentLocale } from "@/utils/getCurrentLocale";

// --- Çoklu dil fallback fonksiyonu ---
function getBestTranslation<T extends Record<string, string>>(
  obj: T | undefined,
  lang: SupportedLocale
) {
  if (!obj) return "";
  if (obj[lang]) return obj[lang];
  for (const l of SUPPORTED_LOCALES) {
    if (obj[l]) return obj[l];
  }
  return "";
}

export default function ArticlesPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("articles");
  const lang = getCurrentLocale();

  const { articles, loading, error } = useAppSelector(
    (state) => state.articles
  );

  useEffect(() => {
    dispatch(fetchArticles(lang));
    return () => {
      dispatch(clearArticlesMessages());
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

  if (!articles || articles.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noArticles")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allArticles")}</PageTitle>

      <ArticlesGrid>
        {articles.map((item, index) => (
          <ArticleCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img
                  src={item.images[0].url}
                  alt={getBestTranslation(item.title, lang)}
                />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{getBestTranslation(item.title, lang) || t("page.untitled")}</h2>
              <p>{getBestTranslation(item.summary, lang) || t("page.noSummary")}</p>
              <Meta>
                <span>
                  {t("page.author")}: {item.author || t("page.unknown")}
                </span>
                <span>
                  {t("page.tags")}: {item.tags?.join(", ") || "—"}
                </span>
              </Meta>
              <ReadMore href={`/articles/${item.slug}`}>
                {t("page.readMore")}
              </ReadMore>
            </CardContent>
          </ArticleCard>
        ))}
      </ArticlesGrid>
    </PageWrapper>
  );
}

// --- Styled Components aynı kalabilir ---

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

const ArticlesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const ArticleCard = styled(motion.div)`
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
