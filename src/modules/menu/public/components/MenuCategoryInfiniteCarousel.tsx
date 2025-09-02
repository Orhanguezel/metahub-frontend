"use client";

import { useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { useAppSelector } from "@/store/hooks";
import { selectMenusPublic } from "@/modules/menu/slice/menuSlice";
import type { IMenu } from "@/modules/menu/types/menu";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { SupportedLocale } from "@/types/common";
import { getMultiLang } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";
import CategoryCarouselCard from "./CategoryCarouselCard";

/* ------------ helpers ------------ */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

const imageOf = (c?: IMenuCategory) => {
  const img = c?.images?.[0];
  return img?.thumbnail || img?.webp || img?.url || "";
};

type CardVM = { id: string; title: string; image?: string; href: string };

/* ------------ component ------------ */
export default function MenuCategoryInfiniteCarousel() {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  // Parent fetch ediyor, store’dan çekiyoruz:
  const menus = useAppSelector(selectMenusPublic) as IMenu[];
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []) as IMenuCategory[];

  // aktif & yayınlanmış menüler içinden **3. menü** (yoksa ilkine düş)
  const thirdMenu = useMemo(() => {
    const active = (menus || []).filter((m) => m?.isActive !== false && m?.isPublished !== false);
    return active[0] || active[0] || null;
  }, [menus]);

  // kategori sözlüğü
  const catDict = useMemo(() => {
    const m = new Map<string, IMenuCategory>();
    for (const c of categories) m.set(asId(c._id), c);
    return m;
  }, [categories]);

  // kartlar (unique + order)
  const catCards = useMemo<CardVM[]>(() => {
    if (!thirdMenu) return [];
    const uniq = new Map<string, CardVM>();
    const ordered = [...(thirdMenu.categories || [])]
      .map((lnk) => ({ ...lnk, category: asId(lnk.category) }))
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

    for (const l of ordered) {
      const id = String(l.category);
      if (uniq.has(id)) continue;
      const cat = catDict.get(id);
      if (!cat) continue;
      const title = getMultiLang((cat.name as any) || {}, uiLang) || cat.slug || cat.code || id;
      const image = imageOf(cat);
      uniq.set(id, { id, title, image, href: `/menu/category/${id}` });
    }
    return Array.from(uniq.values());
  }, [thirdMenu, catDict, uiLang]);

  // sürekli akış listesi (hook sırası değişmez)
  const flow = useMemo<CardVM[]>(() => {
    if (!thirdMenu || catCards.length === 0) return [];
    return [...catCards, ...catCards, ...catCards];
  }, [thirdMenu, catCards]);

  if (flow.length === 0) {
    return (
      <Wrapper>
        <Info>{t("noCategories", { defaultValue: "Kategori yok" })}</Info>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Viewport>
        <Track>
          {flow.map((c, idx) => (
            <Item key={`${c.id}-${idx}`}>
              <CategoryCarouselCard title={c.title} image={c.image} href={c.href} />
            </Item>
          ))}
        </Track>
        <Gradient $side="left" />
        <Gradient $side="right" />
      </Viewport>
    </Wrapper>
  );
}

/* ------------ styles (tek satır sonsuz döngü) ------------ */

/** HIZLANDIRILDI: 28s -> 16s */
const slide = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const Wrapper = styled.section`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto ${({ theme }) => theme.spacings.lg};
  padding: 0 ${({ theme }) => theme.spacings.sm};
`;

const Viewport = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  user-select: none;
`;

const Track = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacings.sm};
  white-space: nowrap;
  animation: ${slide} 16s linear infinite;
  will-change: transform;

  ${Viewport}:hover & { animation-play-state: paused; }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translateX(0);
  }
`;

const Item = styled.div`
  flex: 0 0 auto;
  min-width: 180px;
`;

const Gradient = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 64px;
  pointer-events: none;
  ${({ $side }) => ($side === "left" ? css`left: 0;` : css`right: 0;`)};
  background: linear-gradient(
    to ${({ $side }) => ($side === "left" ? "right" : "left")},
    ${({ theme }) => theme.colors.background} 0%,
    rgba(0,0,0,0) 100%
  );
  @media (max-width: 768px) { width: 32px; }
`;

const Info = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.md};
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  color: ${({ theme }) => theme.colors.darkColor};
`;
