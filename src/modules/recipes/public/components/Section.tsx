"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import translations from "@/modules/recipes/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";

import type { IRecipe } from "@/modules/recipes/types";
import { getMultiLang, type SupportedLocale } from "@/types/recipes/common";

import { FaChartLine, FaLightbulb } from "react-icons/fa";

const ICONS = [
  <FaChartLine size={32} color="#2875c2" key="f1" />,
  <FaLightbulb size={32} color="#2875c2" key="f2" />,
];

export default function RecipesSection() {
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => (i18n.language?.slice(0, 2) as SupportedLocale) || "tr", [i18n.language]);

  const { list, loading, error } = useAppSelector((s) => s.recipe);

  const valid: IRecipe[] = useMemo(
    () => (Array.isArray(list) ? list.filter((x) => !!x && typeof x === "object") : []),
    [list]
  );
  const main = useMemo<IRecipe | null>(() => (valid.length ? valid[0] : null), [valid]);

  const toSlug = (r?: IRecipe | null) =>
    (r?.slug && (r.slug as any)[lang]) ||
    (r?.slug && (r.slug as any).tr) ||
    (r?.slug && (r.slug as any).en) ||
    r?.slugCanonical ||
    "";

  const features = useMemo(() => {
    const arr = [valid[1], valid[2]].filter(Boolean) as IRecipe[];
    return arr.map((item, i) => ({
      icon: ICONS[i],
      title: getMultiLang(item.title, lang),
      summary: getMultiLang(item.description, lang),
      slug: toSlug(item),
    }));
  }, [valid, lang]);

  const rightImagesRaw = useMemo(() => {
    if (!main) return [] as IRecipe[];
    return valid
      .filter((item) => toSlug(item) && toSlug(item) !== toSlug(main) && item.images?.[0]?.url)
      .slice(0, 2);
  }, [valid, main]);

  if (loading) {
    return (
      <Section>
        <RecipesGrid>
          <Left><Skeleton /><Skeleton /><Skeleton /></Left>
          <Right><Skeleton /></Right>
        </RecipesGrid>
      </Section>
    );
  }
  if (error) {
    return (
      <Section>
        <RecipesGrid><ErrorMessage /></RecipesGrid>
      </Section>
    );
  }
  if (!valid.length || !main) {
    return (
      <Section>
        <RecipesGrid>
          <Left>
            <MainTitle>{t("page.recipes.title", "Tarifler")}</MainTitle>
            <Desc>{t("recipes.recipes.empty", "Tarif bulunamadı.")}</Desc>
          </Left>
        </RecipesGrid>
      </Section>
    );
  }

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <RecipesGrid>
        {/* SOL */}
        <Left>
          <MinorTitle>{t("page.recipes.minorTitle", "TARİFLER")}</MinorTitle>
          <MainTitle>{getMultiLang(main.title, lang)}</MainTitle>
          <Desc>{getMultiLang(main.description, lang) || ""}</Desc>

          <Features>
            {features.map((it, i) => (
              <Feature key={i}>
                <IconWrap>{it.icon}</IconWrap>
                <FeatureText>
                  <FeatureTitle>{it.title}</FeatureTitle>
                  <FeatureDesc>{it.summary}</FeatureDesc>
                </FeatureText>
              </Feature>
            ))}
          </Features>

          <SeeAllBtn href="/recipes">{t("page.recipes.all", "Tüm Tarifler")}</SeeAllBtn>
        </Left>

        {/* SAĞ */}
        <Right>
          <MainImageBlock
            href={`/recipes/${toSlug(main)}`}
            src={main.images?.[0]?.url}
            alt={getMultiLang(main.title, lang)}
          />

          {rightImagesRaw.length > 0 && (
            <ThumbRow>
              {rightImagesRaw.map((item) => (
                <ThumbImageBlock
                  key={item._id}
                  href={`/recipes/${toSlug(item)}`}
                  src={item.images?.[0]?.url}
                  alt={getMultiLang(item.title, lang)}
                />
              ))}
            </ThumbRow>
          )}
        </Right>
      </RecipesGrid>
    </Section>
  );
}

/* ---------- görsel yardımcıları ---------- */
function MainImageBlock({ href, src, alt }: { href?: string; src?: string; alt?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  if (!src || !href || errored) return null;
  return (
    <MainImageWrap as={Link} href={href}>
      <MainImage
        src={src}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) 100vw, 340px"
        priority
        style={{ opacity: loaded ? 1 : 0 }}
        onError={() => setErrored(true)}
        onLoadingComplete={() => setLoaded(true)}
      />
    </MainImageWrap>
  );
}
function ThumbImageBlock({ href, src, alt }: { href: string; src?: string; alt?: string }) {
  if (!src) return null;
  return (
    <ThumbLink href={href}>
      <ThumbFrame><ThumbImg src={src} alt={alt || ""} loading="lazy" decoding="async" /></ThumbFrame>
    </ThumbLink>
  );
}

/* ===================== Styles ===================== */
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl};
  ${({ theme }) => theme.media.small} { padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.lg}; }
`;
const RecipesGrid = styled.div`
  max-width: 1280px; margin: 0 auto; display: flex; gap: 2.4rem; align-items: flex-start;
  padding: 0 ${({ theme }) => theme.spacings.xl}; flex-wrap: wrap;
  ${({ theme }) => theme.media.medium} { padding: 0 ${({ theme }) => theme.spacings.md}; gap: 2rem; }
  ${({ theme }) => theme.media.small} { flex-direction: column; gap: 1.6rem; padding: 0 ${({ theme }) => theme.spacings.sm}; text-align: center; align-items: center; }
`;
const Left = styled.div`
  flex: 1.1 1 440px; min-width: 440px; max-width: 640px; display: flex; flex-direction: column; gap: 1.1rem;
  ${({ theme }) => theme.media.small} { min-width: 0 !important; max-width: 100% !important; width: 100% !important; align-items: center; text-align: center; gap: 1.4rem; }
`;
const Right = styled.div`
  flex: 1.5 1 320px; min-width: 270px; display: flex; flex-direction: column; align-items: center; justify-content: right; gap: .9rem; line-height: 0; width: 100%;
  ${({ theme }) => theme.media.small} { max-width: 100% !important; margin: 0 auto; gap: ${({ theme }) => theme.spacings.sm}; }
`;
const MainImageWrap = styled(Link)`
  width: 340px; aspect-ratio: 16/9; background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden; box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin: 0 auto ${({ theme }) => theme.spacings.xs}; position: relative; display: block; line-height: 0;
  ${({ theme }) => theme.media.small} { width: 100%; max-width: 340px; margin: 0 auto ${({ theme }) => theme.spacings.xs}; }
`;
const MainImage = styled(Image)` object-fit: cover; display: block; z-index: 2; transition: opacity 180ms ease; `;
const ThumbRow = styled.div`
  display: flex; flex-direction: row; justify-content: right; align-items: center; gap: .8rem;
  width: 100%; max-width: 340px; margin: 0 auto;
  ${({ theme }) => theme.media.small} { max-width: 340px; gap: .5rem; justify-content: center; }
`;
const ThumbLink = styled(Link)` display: block; cursor: pointer; `;
const ThumbFrame = styled.div`
  width: 135px; aspect-ratio: 3/2; overflow: hidden; background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07); line-height: 0;
  ${({ theme }) => theme.media.small} { width: 48%; max-width: 170px; }
`;
const ThumbImg = styled.img` width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .15s; &:hover { transform: scale(1.055); } `;
const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm}; color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold}; text-transform: uppercase; letter-spacing: .025em;
`;
const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem); color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading}; font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 .45em 0; letter-spacing: -0.01em; line-height: 1.13;
`;
const Desc = styled.p` color: ${({ theme }) => theme.colors.textSecondary}; font-size: ${({ theme }) => theme.fontSizes.base}; line-height: 1.7; margin-bottom: 1.2rem; `;
const Features = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem 1.1rem; margin: 1.8rem 0 1rem 0;
  @media (max-width: 700px) { grid-template-columns: 1fr; gap: 1rem; margin: 1.2rem 0 .6rem 0; }
`;
const Feature = styled.div`
  display: flex; align-items: flex-start; gap: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  padding: 1.2rem 1rem 1rem; min-height: 135px;
`;
const IconWrap = styled.div`
  min-width: 44px; min-height: 44px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primaryTransparent} 40%, ${({ theme }) => theme.colors.backgroundAlt} 100%);
  display: flex; align-items: center; justify-content: center; box-shadow: ${({ theme }) => theme.shadows.xs};
`;
const FeatureText = styled.div` flex: 1; display: flex; flex-direction: column; min-width: 0; `;
const FeatureTitle = styled.h3` font-size: 1.14rem; color: ${({ theme }) => theme.colors.primary}; font-weight: ${({ theme }) => theme.fontWeights.semiBold}; margin-bottom: .21rem; line-height: 1.2; white-space: pre-line; `;
const FeatureDesc = styled.div`
  font-size: .97rem; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.55;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; text-overflow: ellipsis; min-height: 2.7em;
`;
