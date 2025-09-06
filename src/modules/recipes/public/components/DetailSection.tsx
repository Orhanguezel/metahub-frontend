"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import translations from "@/modules/recipes/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  clearRecipesMessages,
  fetchRecipeBySlug,
  setSelectedRecipe,
  fetchRecipesPublic,
} from "@/modules/recipes/slice/recipeSlice";

import type { IRecipe } from "@/modules/recipes/types";
import { getMultiLang, type SupportedLocale } from "@/types/recipes/common";

export default function RecipesDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => (i18n.language?.slice(0, 2) as SupportedLocale) || "tr", [i18n.language]);

  const dispatch = useAppDispatch();
  const { selected, list, loading, error } = useAppSelector((s) => s.recipe);

  // i18n bundle’ları
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "recipes")) {
      i18n.addResourceBundle(lng, "recipes", resources, true, true);
    }
  });

  useEffect(() => {
    // list yoksa listeyi de çek (other list için)
    if (!list || list.length === 0) dispatch(fetchRecipesPublic());
  }, [dispatch, list?.length]);

  useEffect(() => {
    const findLocal = (items: IRecipe[], slugIn: string): IRecipe | undefined =>
      items.find((r) => {
        const so = r.slug || {};
        const slugs = [
          (so as any)[lang],
          (so as any).tr,
          (so as any).en,
          r.slugCanonical,
        ].filter(Boolean);
        return slugs.includes(slugIn.toLowerCase());
      });

    if (list && list.length > 0) {
      const found = findLocal(list, slug);
      if (found) {
        dispatch(setSelectedRecipe(found));
      } else {
        dispatch(fetchRecipeBySlug(slug));
      }
    } else {
      dispatch(fetchRecipeBySlug(slug));
    }

    return () => { dispatch(clearRecipesMessages()); };
  }, [dispatch, list, slug, lang]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !selected) {
    return (
      <Container>
        <ErrorMessage message={error || t("page.notFound", "İçerik bulunamadı.")} />
      </Container>
    );
  }

  const recipe = selected;
  const title = getMultiLang(recipe.title, lang);
  const cover = recipe.images?.[0]?.url;
  const others = (list || []).filter((r) => r._id !== recipe._id);

  // yardımcı
  const toSlug = (r: IRecipe) =>
    (r.slug && (r.slug as any)[lang]) ||
    (r.slug && (r.slug as any).tr) ||
    (r.slug && (r.slug as any).en) ||
    r.slugCanonical ||
    "";

  return (
    <Container initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.57 }}>
      <Title>{title}</Title>

      {cover && (
        <ImageWrapper>
          <StyledImage src={cover} alt={title} width={1080} height={410} priority />
      </ImageWrapper>
      )}

      {/* Kısa açıklama */}
      {recipe.description && getMultiLang(recipe.description, lang) && (
        <SummaryBox>
          <div>{getMultiLang(recipe.description, lang)}</div>
        </SummaryBox>
      )}

      {/* Bilgi çipleri */}
      <Chips>
        {recipe.cuisines?.map((c) => <Chip key={c}>{c}</Chip>)}
        {recipe.totalMinutes != null && <Chip>{t("time", "Süre")}: {recipe.totalMinutes}′</Chip>}
        {recipe.servings != null && <Chip>{t("servings", "Porsiyon")}: {recipe.servings}</Chip>}
        {recipe.calories != null && <Chip>{t("calories", "Kalori")}: {recipe.calories}</Chip>}
        {(recipe.tags || []).map((tg, i) => <Chip key={i}>{getMultiLang(tg as any, lang)}</Chip>)}
      </Chips>

      {/* Malzemeler */}
      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <SectionBlock>
          <h3>{t("ingredients", "Malzemeler")}</h3>
          <List>
            {recipe.ingredients.map((ing, i) => {
              const name = getMultiLang(ing.name as any, lang);
              const amount = ing.amount ? getMultiLang(ing.amount as any, lang) : "";
              return (
                <li key={i}>
                  <span>{name}</span>
                  {amount && <small> — {amount}</small>}
                </li>
              );
            })}
          </List>
        </SectionBlock>
      )}

      {/* Adımlar */}
      {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
        <SectionBlock>
          <h3>{t("steps", "Adımlar")}</h3>
          <Ol>
            {recipe.steps.map((st) => (
              <li key={st.order}>{getMultiLang(st.text as any, lang)}</li>
            ))}
          </Ol>
        </SectionBlock>
      )}

      {/* Diğer tarifler */}
      {others.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Tarifler")}</OtherTitle>
          <OtherGrid>
            {others.slice(0, 8).map((item) => {
              const s = toSlug(item);
              return (
                <OtherCard key={item._id} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
                  <OtherImgWrap>
                    {item.images?.[0]?.url ? (
                      <OtherImg src={item.images[0].url} alt={getMultiLang(item.title, lang)} width={60} height={40} />
                    ) : (
                      <OtherImgPlaceholder />
                    )}
                  </OtherImgWrap>
                  <OtherTitleMini>
                    <Link href={`/recipes/${s}`}>{getMultiLang(item.title, lang)}</Link>
                  </OtherTitleMini>
                </OtherCard>
              );
            })}
          </OtherGrid>
        </OtherSection>
      )}
    </Container>
  );
}

/* --------- styles --------- */
const Container = styled(motion.section)`
  max-width: 950px; margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 650px) { padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs}; }
`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center; letter-spacing: .01em;
`;
const ImageWrapper = styled.div`
  width: 100%; margin: 0 auto ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden; box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex; justify-content: center; align-items: center;
`;
const StyledImage = styled(Image)` max-width: 100%; height: auto; object-fit: contain !important; border-radius: ${({ theme }) => theme.radii.lg}; display: block; `;
const SummaryBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-left: 5px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.xs};
`;
const Chips = styled.div` display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: ${({ theme }) => theme.spacings.lg}; `;
const Chip = styled.span`
  background: ${({ theme }) => theme.colors.accent}22;
  color: ${({ theme }) => theme.colors.primary};
  padding: .22em .9em; border-radius: ${({ theme }) => theme.radii.pill};
  font-size: .95em; font-weight: 500;
`;
const SectionBlock = styled.section`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  h3 { margin-bottom: ${({ theme }) => theme.spacings.md}; color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.lg}; }
`;
const List = styled.ul` display: grid; gap: .4rem; padding-left: 1rem; `;
const Ol = styled.ol` display: grid; gap: .4rem; padding-left: 1.2rem; `;
const OtherSection = styled.div` margin-top: ${({ theme }) => theme.spacings.xxl}; border-top: 1.5px solid ${({ theme }) => theme.colors.borderLight}; padding-top: ${({ theme }) => theme.spacings.lg}; `;
const OtherTitle = styled.h3` color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.large}; margin-bottom: ${({ theme }) => theme.spacings.lg}; font-weight: ${({ theme }) => theme.fontWeights.semiBold}; `;
const OtherGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem 1.8rem; margin-top: .7rem; `;
const OtherCard = styled(motion.div)` background: ${({ theme }) => theme.colors.backgroundAlt}; border-radius: ${({ theme }) => theme.radii.lg}; box-shadow: ${({ theme }) => theme.shadows.xs}; border: 1.3px solid ${({ theme }) => theme.colors.borderLight}; padding: 1.1rem 1.2rem 1rem; display: flex; align-items: center; gap: 1.1rem; transition: box-shadow .18s, border .18s, transform .16s; cursor: pointer; min-height: 72px;
  &:hover,&:focus-visible { box-shadow: ${({ theme }) => theme.shadows.md}; border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-5px) scale(1.035); z-index: 2; }
`;
const OtherImgWrap = styled.div` flex-shrink: 0; width: 60px; height: 40px; border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden; background: ${({ theme }) => theme.colors.backgroundSecondary}; display: flex; align-items: center; justify-content: center; `;
const OtherImg = styled(Image)` width: 100%; height: 100%; object-fit: contain; border-radius: ${({ theme }) => theme.radii.md}; `;
const OtherImgPlaceholder = styled.div` width: 60px; height: 40px; background: ${({ theme }) => theme.colors.skeleton}; opacity: .36; border-radius: ${({ theme }) => theme.radii.md}; `;
const OtherTitleMini = styled.div` font-size: ${({ theme }) => theme.fontSizes.base}; font-weight: ${({ theme }) => theme.fontWeights.semiBold}; color: ${({ theme }) => theme.colors.primary};
  a { color: inherit; text-decoration: none; &:hover { text-decoration: underline; } }
`;
