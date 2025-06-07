"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchReferences,
  clearReferenceMessages,
} from "@/modules/references/slice/referencesSlice";
import { useTranslation } from "react-i18next";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import type { IReference } from "@/modules/references/types/reference";

export default function ReferencePage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("reference");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { references, loading, error } = useAppSelector(
    (state) => state.references
  );

  useEffect(() => {
    dispatch(fetchReferences());
    return () => {
      dispatch(clearReferenceMessages());
    };
  }, [dispatch]);

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

  if (!references || references.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.empty", "No Reference content found.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.all", "Reference Sections")}</PageTitle>
      <Grid>
        {references.map((item: IReference, index: number) => (
          <Card
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Görsel */}
            {item.images && item.images.length > 0 && item.images[0]?.url && (
              <ImageWrapper>
                <img
                  src={item.images[0].url}
                  alt={item.title?.[lang] || "Reference Image"}
                  loading="lazy"
                />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{item.title?.[lang]}</h2>
              <p>
                {item.summary?.[lang]?.slice(0, 160) ||
                  item.content?.[lang]?.slice(0, 160) ||
                  "..."}
              </p>
              {/* Kategori */}
              {item.category && item.category.name && (
                <CategoryTag>
                  {item.category.name[lang] || item.category.name.en}
                </CategoryTag>
              )}
              {/* Etiketler */}
              {(item.tags?.length ?? 0) > 0 && (
                <TagList>
                  {(item.tags ?? []).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </TagList>
              )}
              {/* Devamı */}
              <ReadMore href={`/references/${item.slug}`}>
                {t("page.readMore", "Read More →")}
              </ReadMore>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </PageWrapper>
  );
}

// --- Styled Components değişmeden kalabilir ---
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

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const Card = styled(motion.div)`
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

const CategoryTag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.info};
  color: #fff;
  font-size: 0.85em;
  border-radius: 6px;
  padding: 0.2em 0.7em;
  margin-right: 0.5em;
  margin-bottom: 0.5em;
`;

const TagList = styled.div`
  margin-bottom: 0.5em;
`;

const Tag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.tagBackground || "#eee"};
  color: #fff;
  font-size: 0.8em;
  border-radius: 6px;
  padding: 0.18em 0.6em;
  margin-right: 0.35em;
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
