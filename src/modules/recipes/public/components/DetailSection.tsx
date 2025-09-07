"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

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
import { getUILang } from "@/i18n/recipes/getUILang";
import { useRecipeReactions } from "@/hooks/useRecipeReactions";

/* ---------- tiny toast (local) ---------- */
type Toast = { id: number; type?: "info"|"success"|"error"; msg: string };
function useToasts() {
  const [items, setItems] = useState<Toast[]>([]);
  const add = (msg: string, type: Toast["type"]="info") => {
    const id = Date.now() + Math.random();
    setItems((a)=>[...a, { id, type, msg }]);
    setTimeout(()=> setItems((a)=>a.filter(t=>t.id!==id)), 2400);
  };
  const remove = (id:number)=>setItems((a)=>a.filter(t=>t.id!==id));
  return { items, add, remove };
}
function Toasts({items, onRemove}:{items:Toast[]; onRemove:(id:number)=>void}) {
  return (
    <ToastWrap>
      {items.map(t=>(
        <ToastItem key={t.id} data-type={t.type}>
          <span>{t.msg}</span>
          <button onClick={()=>onRemove(t.id)} aria-label="close">×</button>
        </ToastItem>
      ))}
    </ToastWrap>
  );
}

/* ---------- JSON-LD component ---------- */
function RecipeJsonLd({
  recipe,
  lang,
  ratingAvg,
  ratingCount,
}: {
  recipe: IRecipe;
  lang: SupportedLocale;
  ratingAvg: number | null;
  ratingCount: number;
}) {
  const title = getMultiLang(recipe.title as any, lang) || recipe.slugCanonical || "Recipe";
  const cover = recipe.images?.[0]?.url;
  const desc = getMultiLang(recipe.description as any, lang) || "";
  const ingredients = (recipe.ingredients || []).map((i) => getMultiLang((i as any).name, lang)).filter(Boolean);
  const instructions = (recipe.steps || []).map((s) => ({ "@type": "HowToStep", text: getMultiLang((s as any).text, lang) })).filter((x) => !!x.text);
  const data: any = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    description: desc,
    image: cover ? [cover] : [],
    recipeCuisine: recipe.cuisines || [],
    recipeIngredient: ingredients,
    recipeInstructions: instructions,
    recipeYield: recipe.servings ? `${recipe.servings} serving(s)` : undefined,
    totalTime: recipe.totalMinutes ? `PT${recipe.totalMinutes}M` : undefined,
  };
  if (ratingCount > 0 && ratingAvg != null) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: ratingAvg, ratingCount };
  }
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    </Head>
  );
}

export default function RecipesDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();
  const { selected, list, loading, error } = useAppSelector((s) => s.recipe);

  const { items:toasts, add:addToast, remove:removeToast } = useToasts();

  // i18n bundle’ları
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "recipes")) {
      i18n.addResourceBundle(lng, "recipes", resources, true, true);
    }
  });

  // liste yoksa çek
  useEffect(() => {
    if (!list || list.length === 0) (dispatch as any)(fetchRecipesPublic());
  }, [dispatch, list]);

  // detayı çek
  useEffect(() => {
    const findLocal = (items: IRecipe[], slugIn: string): IRecipe | undefined =>
      items.find((r) => {
        const so = r.slug || {};
        const slugs = [
          (so as any)[lang],
          (so as any).tr,
          (so as any).en,
          r.slugCanonical,
        ].filter(Boolean).map(String).map((s) => s.toLowerCase());
        return slugs.includes(slugIn.toLowerCase());
      });

    if (list && list.length > 0) {
      const found = findLocal(list, slug);
      if (found) {
        dispatch(setSelectedRecipe(found));
      } else {
        (dispatch as any)(fetchRecipeBySlug(slug));
      }
    } else {
      (dispatch as any)(fetchRecipeBySlug(slug));
    }

    return () => { dispatch(clearRecipesMessages()); };
  }, [dispatch, list, slug, lang]);

  // ---- REACTIONS HOOK (UNCONDITIONAL!) ----
  // Hook her render’da çağrılsın; target yoksa undefined veriyoruz (hook no-op çalışır)
  const rxTargetId = selected ? String(selected._id) : undefined;
  const { summary, mine, toggle, toggleEmoji, rate } = useRecipeReactions(rxTargetId);
  const EMOJIS = ["👍", "🔥", "😍", "😋"];

  // öneriler
  const [topReacted, setTopReacted] = useState<IRecipe[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await (dispatch as any)(fetchRecipesPublic({ sort: "top", limit: 8 } as any)).unwrap();
        setTopReacted(res?.data || []);
      } catch {/* ignore */}
    })();
  }, [dispatch]);

  // erken dönüşler (hook çağrısından SONRA)
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

  const toSlug = (r: IRecipe) =>
    (r.slug && (r.slug as any)[lang]) ||
    (r.slug && (r.slug as any).tr) ||
    (r.slug && (r.slug as any).en) ||
    r.slugCanonical ||
    "";

  const onToggle = async (kind: "LIKE"|"FAVORITE"|"BOOKMARK") => {
    await toggle(kind);
    addToast(t("saved","Kaydedildi"), "success");
  };
  const onEmoji = async (e: string) => {
    await toggleEmoji(e);
    addToast(`${t("saved","Kaydedildi")} ${e}`, "success");
  };
  const onRate = async (v: 1|2|3|4|5) => {
    const ok = await rate(v);
    addToast(ok ? t("saved","Kaydedildi") : t("error","Hata"), ok ? "success" : "error");
  };

  // diğerleri
  const others = (list || []).filter((r) => r._id !== recipe._id);

  return (
    <Container initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.57 }}>
      {/* JSON-LD */}
      <RecipeJsonLd recipe={recipe} lang={lang} ratingAvg={summary.ratingAvg} ratingCount={summary.ratingCount} />

      <Title>{title}</Title>

      {cover && (
        <ImageWrapper>
          <StyledImage src={cover} alt={title} width={1080} height={410} priority sizes="(max-width:1000px) 100vw, 950px" />
        </ImageWrapper>
      )}

      {/* Reaksiyon barı */}
      <RxWrap>
        <Left>
          <div className="emojis">
            {EMOJIS.map((e) => (
              <Emoji key={e} $on={mine.emojis.has(e)} onClick={() => onEmoji(e)} title={`${e} ${summary.emojis[e] || 0}`}>
                <span>{e}</span>
                <small>{summary.emojis[e] || 0}</small>
              </Emoji>
            ))}
          </div>
        </Left>
        <Center>
          {[1,2,3,4,5].map((v)=>(
            <Star
              key={v}
              aria-pressed={mine.rating === v}
              onClick={() => onRate(v as 1 | 2 | 3 | 4 | 5)}
              title={t("rate", "Puan ver")}
            >
              {(mine.rating ?? Math.round(summary.ratingAvg || 0)) >= v ? "★" : "☆"}
            </Star>
          ))}
          {summary.ratingAvg != null && (
            <Avg>({summary.ratingAvg.toFixed(1)})</Avg>
          )}
        </Center>
        <Right>
          <RxBtn aria-pressed={mine.like} onClick={() => onToggle("LIKE")} title={t("like", "Beğen")}>
            {mine.like ? "👍" : "👍🏻"}
          </RxBtn>
          <RxBtn aria-pressed={mine.favorite} onClick={() => onToggle("FAVORITE")} title={t("favorite", "Favori")}>
            {mine.favorite ? "❤️" : "🤍"}
          </RxBtn>
          <RxBtn aria-pressed={mine.bookmark} onClick={() => onToggle("BOOKMARK")} title={t("bookmark", "Kaydet")}>
            {mine.bookmark ? "🔖" : "📑"}
          </RxBtn>
        </Right>
      </RxWrap>

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
          <UL>
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
          </UL>
        </SectionBlock>
      )}

      {/* Adımlar */}
      {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
        <SectionBlock>
          <h3>{t("steps", "Adımlar")}</h3>
          <OL>
            {recipe.steps.map((st) => (
              <li key={st.order}>{getMultiLang(st.text as any, lang)}</li>
            ))}
          </OL>
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

      {/* En çok reaksiyon alanlar */}
      {topReacted.length > 0 && (
        <OtherSection>
          <OtherTitle>🔥 {t("page.topReacted", "En Çok Reaksiyon Alanlar")}</OtherTitle>
          <OtherGrid>
            {topReacted.map((item) => {
              const s = toSlug(item);
              return (
                <OtherCard key={`top-${item._id}`} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
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

      {/* toasts */}
      <Toasts items={toasts} onRemove={removeToast} />
    </Container>
  );
}

/* --------- styles --------- */
const ToastWrap = styled.div`
  position: fixed; z-index: 9999; right: 16px; bottom: 16px;
  display: grid; gap: 8px;
`;
const ToastItem = styled.div`
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  box-shadow:${({theme})=>theme.shadows.md};
  &[data-type="success"] { border-color: #20b26b55; }
  &[data-type="error"] { border-color: #e0565655; }
  button{border:0;background:transparent;cursor:pointer;font-size:16px;opacity:.75;}
`;

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
const RxWrap = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.md};
  margin-bottom:${({theme})=>theme.spacings.md};
`;
const Left = styled.div` .emojis{display:flex;gap:${({theme})=>theme.spacings.sm};flex-wrap:wrap;} `;
const Center = styled.div` display:inline-flex;align-items:center;gap:6px; `;
const Right = styled.div` display:flex;align-items:center;gap:${({theme})=>theme.spacings.sm}; `;
const Emoji = styled.button<{ $on?: boolean }>`
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme,$on})=>($on?theme.colors.primaryLight:theme.colors.inputBackgroundLight)};
  cursor:pointer; small{opacity:.8;}
`;
const Star = styled.button`border:none;background:transparent;cursor:pointer;font-size:22px;line-height:1;`;
const Avg = styled.span`opacity:.75;margin-inline-start:4px;`;
const RxBtn = styled.button`border:none;background:transparent;font-size:18px;cursor:pointer;`;

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
  h3 { margin-bottom: ${({ theme }) => theme.spacings.md}; color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.lg }; }
`;
const UL = styled.ul` display: grid; gap: .4rem; padding-left: 1rem; `;
const OL = styled.ol` display: grid; gap: .4rem; padding-left: 1.2rem; `;
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
