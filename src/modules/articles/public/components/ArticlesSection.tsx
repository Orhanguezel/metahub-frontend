"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchArticles } from "@/modules/articles/slice/articlesSlice";
import { Skeleton, ErrorMessage } from "@/shared";

export default function ArticlesSection() {
  const { t, i18n } = useTranslation("articles");
  const dispatch = useAppDispatch();
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { articles, loading, error } = useAppSelector(
    (state) => state.articles
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchArticles(lang));
  }, [dispatch, lang]);

  if (!mounted) return null;

  const latestArticles = articles.slice(0, 3);

  return (
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>📰 {t("page.articles.title")}</Title>

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
            {latestArticles.map((item, index) => (
              <CardLink key={item._id} href={`/articles/${item.slug}`} passHref>
                <Card
                  as={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Content>
                    <ArticlesTitle>{item.title?.[lang]}</ArticlesTitle>
                    <Excerpt>{item.summary?.[lang]}</Excerpt>
                  </Content>

                  {item.images?.[0]?.url && (
                    <StyledImage
                      src={item.images[0].url}
                      alt={item.title?.[lang]}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                    />
                  )}
                </Card>
              </CardLink>
            ))}
          </Grid>

          <SeeAll href="/articles">{t("page.articles.all")}</SeeAll>
        </>
      )}
    </Section>
  );
}

// Styled Components
const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
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

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform ${({ theme }) => theme.transition.fast};
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const Content = styled.div`
  text-align: left;
`;

const ArticlesTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledImage = styled(motion.img)`
  width: 220px;
  height: auto;
  border-radius: ${({ theme }) => theme.radii.sm};
  object-fit: cover;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s ease;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 767px) {
    width: 100%;
  }
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
