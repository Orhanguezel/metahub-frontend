"use client";

import styled from "styled-components";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import { Skeleton, ErrorMessage } from "@/shared";

import type { IRecipe } from "@/modules/recipes/types";
import { fetchRecipesPublic } from "@/modules/recipes/slice/recipeSlice";
import { getMultiLang, type SupportedLocale } from "@/types/recipes/common";

export default function RecipesPage() {
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => (i18n.language?.slice(0, 2) as SupportedLocale) || "tr", [i18n.language]);

  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((s) => s.recipe);

  // i18n bundle’ları güvenceye al
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "recipes")) {
      i18n.addResourceBundle(lng, "recipes", resources, true, true);
    }
  });

  useEffect(() => {
    if (!list || list.length === 0) {
      dispatch(fetchRecipesPublic());
    }
  }, [dispatch, list]);

  const toSlug = (item: IRecipe) =>
    (item.slug && (item.slug as any)[lang]) ||
    (item.slug && (item.slug as any).tr) ||
    (item.slug && (item.slug as any).en) ||
    item.slugCanonical ||
    "";

  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allRecipes", "Tüm Tarifler")}</PageTitle>
        <RecipesGrid>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </RecipesGrid>
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

  if (!list || list.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allRecipes", "Tüm Tarifler")}</PageTitle>
        <EmptyMsg>{t("page.noRecipes", "Herhangi bir içerik bulunamadı.")}</EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allRecipes", "Tüm Tarifler")}</PageTitle>
      <RecipesGrid>
        {list.map((item) => {
          const slug = toSlug(item);
          const detailHref = `/recipes/${slug}`;
          const title = getMultiLang(item.title, lang);
          const cover = item.images?.[0]?.url;

          return (
            <RecipesCard
              key={item._id}
              as={motion.div}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href={detailHref} tabIndex={-1} style={{ display: "block" }}>
                <ImageWrapper>
                  {cover ? (
                    <StyledImage src={cover} alt={title} width={440} height={210} loading="lazy" />
                  ) : (
                    <ImgPlaceholder />
                  )}
                </ImageWrapper>
              </Link>

              <CardContent>
                <CardTitle as={Link} href={detailHref}>
                  {title}
                </CardTitle>

                {/* Public list API description dönmüyor — kısa bilgi olarak süre/kalori etiketleri */}
                <Tags>
                  {item.totalMinutes != null && <Tag>{t("time", "Süre")}: {item.totalMinutes}′</Tag>}
                  {item.servings != null && <Tag>{t("servings", "Porsiyon")}: {item.servings}</Tag>}
                  {item.calories != null && <Tag>{t("calories", "Kalori")}: {item.calories}</Tag>}
                  {(item.tags || []).slice(0, 4).map((tg, i) => (
                    <Tag key={i}>{getMultiLang(tg as any, lang)}</Tag>
                  ))}
                </Tags>

                <ReadMore href={detailHref}>{t("page.readMore", "Detayları Gör →")}</ReadMore>
              </CardContent>
            </RecipesCard>
          );
        })}
      </RecipesGrid>
    </PageWrapper>
  );
}

/* ----- styles ----- */
const PageWrapper = styled.div`
  max-width: 1260px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 600px) { padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs}; }
`;
const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;
const RecipesGrid = styled.div`
  display: grid;
  gap: 2.1rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  align-items: stretch;
  margin: 0 auto;
  @media (max-width: 800px) { gap: 1.3rem; }
`;
const RecipesCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.4px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: box-shadow 0.17s, border 0.17s, transform 0.16s;
  cursor: pointer; min-height: 335px;
  &:hover, &:focus-visible { box-shadow: ${({ theme }) => theme.shadows.lg}; border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-8px) scale(1.035); z-index: 1; }
`;
const ImageWrapper = styled.div`
  width: 100%; height: 180px; overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex; align-items: center; justify-content: center; line-height: 0;
`;
const StyledImage = styled(Image)` width: 100%; height: 180px; object-fit: cover; display: block; `;
const ImgPlaceholder = styled.div` width: 100%; height: 180px; background: ${({ theme }) => theme.colors.skeleton}; opacity: 0.38; `;
const CardContent = styled.div` padding: ${({ theme }) => theme.spacings.lg}; flex: 1; display: flex; flex-direction: column; gap: .7rem; `;
const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: 0.13em; cursor: pointer; transition: color .17s;
  &:hover,&:focus { color: ${({ theme }) => theme.colors.primary}; text-decoration: underline; }
`;
const Tags = styled.div` display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .3em; `;
const Tag = styled.span`
  background: ${({ theme }) => theme.colors.accent}22;
  color: ${({ theme }) => theme.colors.primary};
  padding: .21em 1.07em; font-size: .96em; border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: 500; letter-spacing: .01em; display: inline-block;
`;
const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center; font-size: 1.18em; margin: 2.4em 0 1.7em 0;
`;
const ReadMore = styled(Link)`
  margin-top: auto; font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary}; text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.md}; padding: .17em .9em;
  background: ${({ theme }) => theme.colors.backgroundSecondary}; box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: background .19s, color .16s;
  &:hover, &:focus-visible { background: ${({ theme }) => theme.colors.primary}; color: #fff; text-decoration: none; }
`;
