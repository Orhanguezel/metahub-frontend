"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/reactions/locales";

import { selectMyReactions } from "@/modules/reactions/slice";
import { selectMenuItemsPublic } from "@/modules/menu/slice/menuitemSlice";

import type { SupportedLocale } from "@/types/common";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import type { IMyReactionItem } from "@/modules/reactions/types";

/* kart bileşeni ayrıdır */
import ReactionsCarouselCard from "./ReactionsCarouselCard";

/* ------------ helpers ------------- */
const normId = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if ((v as any).$oid) return String((v as any).$oid);
    if ((v as any)._id) return String((v as any)._id);
  }
  return String(v);
};

/* ------------ responsive sabitler ------------- */
const CARD_WIDTH_DESKTOP = 320;
const CARD_WIDTH_MOBILE = 320;
const GAP = 8;
const FADE_WIDTH = 32;
const NAV_BTN_WIDTH = 48;

const getSlotCount = (w: number) => (w < 700 ? 1 : 3);
const getCardWidth = (w: number) => (w < 700 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP);

export default function ReactionsSection() {
  const { i18n, t } = useI18nNamespace("reactions", translations);
  void t; // metinler kart içinde de kullanılıyor
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { profile } = useAppSelector((s) => s.account);
  const isLoggedIn = !!profile;

  const rxState = useAppSelector((s) => s.reactions);
  const loadingRx = !!rxState?.loading;
  const errorRx = rxState?.error || null;

  const myAll = useAppSelector(selectMyReactions) as IMyReactionItem[];
  const itemsAll = useAppSelector(selectMenuItemsPublic) as IMenuItem[];
  const menuLoading = useAppSelector((s: any) => s.menuitem?.loading) || false;

  /* --- kullanıcı dokunduğu hedefler -> ürün eşlemesi --- */
  const targetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of myAll) if (r.targetId) ids.add(normId(r.targetId));
    return Array.from(ids);
  }, [myAll]);

  const byId = useMemo(() => {
    const m = new Map<string, IMenuItem>();
    for (const it of itemsAll) {
      const id = normId((it as any)?._id);
      if (id) m.set(id, it);
    }
    return m;
  }, [itemsAll]);

  const bySlug = useMemo(() => {
    const m = new Map<string, IMenuItem>();
    for (const it of itemsAll) if (it?.slug) m.set(String(it.slug).toLowerCase(), it);
    return m;
  }, [itemsAll]);

  const byCode = useMemo(() => {
    const m = new Map<string, IMenuItem>();
    for (const it of itemsAll) if (it?.code) m.set(String(it.code).toLowerCase(), it);
    return m;
  }, [itemsAll]);

  const items = useMemo((): IMenuItem[] => {
    const out: IMenuItem[] = [];
    for (const tid of targetIds) {
      const keyLc = String(tid).toLowerCase();
      const it: IMenuItem | undefined = byId.get(tid) ?? bySlug.get(keyLc) ?? byCode.get(keyLc);
      if (it) out.push(it);
    }
    return out;
  }, [targetIds, byId, bySlug, byCode]);

  const itemsSorted = useMemo(() => {
    const lastIndexMap = new Map<string, number>();
    myAll.forEach((r, i) => lastIndexMap.set(normId(r.targetId), i));
    return [...items].sort(
      (a, b) =>
        (lastIndexMap.get(normId((b as any)._id)) || 0) -
        (lastIndexMap.get(normId((a as any)._id)) || 0)
    );
  }, [items, myAll]);

  /* --------- carousel state (sonsuz döngü) ---------- */
  const [slotCount, setSlotCount] = useState(3);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setSlotCount(getSlotCount(w));
      setCardWidth(getCardWidth(w));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [cards, setCards] = useState<IMenuItem[]>([]);
  useEffect(() => {
    setCards(itemsSorted);
  }, [itemsSorted]);

  const [x, setX] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const canSlide = cards.length > Math.max(1, slotCount);

  const stepPx = cardWidth + GAP;
  const goNext = useCallback(() => {
    if (!canSlide || isSliding) return;
    setIsSliding(true);
    setX(-stepPx);
    setAnimKey((k) => k + 1);
  }, [canSlide, isSliding, stepPx]);

  const goPrev = useCallback(() => {
    if (!canSlide || isSliding) return;
    setIsSliding(true);
    setX(stepPx);
    setAnimKey((k) => k + 1);
  }, [canSlide, isSliding, stepPx]);

  const onAnimationComplete = useCallback(() => {
    setCards((prev) => {
      if (x < 0) return [...prev.slice(1), prev[0]];
      if (x > 0) return [prev[prev.length - 1], ...prev.slice(0, -1)];
      return prev;
    });
    setX(0);
    setIsSliding(false);
    setAnimKey((k) => k + 1);
  }, [x]);

  useEffect(() => {
    if (!canSlide) return;
    const id = setInterval(() => {
      if (!isSliding) goNext();
    }, 4800);
    return () => clearInterval(id);
  }, [canSlide, isSliding, goNext]);

  const TOTAL_WIDTH = cardWidth * slotCount + GAP * (slotCount - 1) + 2 * NAV_BTN_WIDTH;

  /* -------------------- GÖRÜNÜRLÜK KURALI --------------------
   * 1) Login değil + içerik yok  -> hiç render etme
   * 2) Login + ready + içerik yok -> hiç render etme
   * 3) Diğer durumlarda (ör. login + loading) istersen skeleton göster
   */
  const hasContent = itemsSorted.length > 0;
  const isReady = !loadingRx && !menuLoading && !errorRx;

  if (!isLoggedIn && !hasContent) return null;
  if (isLoggedIn && isReady && !hasContent) return null;

  /* ----------- view seçimi ----------- */
  let content: React.ReactNode;

  if (isLoggedIn && (loadingRx || menuLoading)) {
    content = (
      <>
        <Header />
        <SkeletonRow>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkelCard key={i} />
          ))}
        </SkeletonRow>
      </>
    );
  } else if (isLoggedIn && errorRx) {
    // Misafir hatalarını göstermiyoruz; sadece login kullanıcı gerçek hatayı görsün
    content = (
      <Header>
        <ErrorMessage />
      </Header>
    );
  } else {
    // İçerik varsa carousel göster (login ya da ileride guest-suggest senaryosu)
    content = (
      <>
        <Header />
        <CarouselWrapper $totalWidth={TOTAL_WIDTH}>
          <FadeEdgeXLeft $fadeWidth={FADE_WIDTH} />
          <FadeEdgeXRight $fadeWidth={FADE_WIDTH} />

          {canSlide && (
            <NavBtn onClick={goPrev} aria-label="Önceki" $side="left" tabIndex={0}>
              <MdArrowBackIos size={28} />
            </NavBtn>
          )}

          <CarouselWindow $slotCount={slotCount} $cardWidth={cardWidth} $gap={GAP}>
<motion.div
  key={animKey}
  style={{
    display: "flex",
    flexWrap: "nowrap",             // 🔒 satır sarmayı kapat
    gap: `${GAP}px`,
    minHeight: 0,
    position: "relative",
    left: 0,
    width: `calc(${cardWidth * cards.length + GAP * (cards.length - 1)}px)`,
  }}
  animate={{ x }}
  transition={{ duration: 0.5, ease: "easeInOut" }}
  onAnimationComplete={isSliding ? onAnimationComplete : undefined}
>
  {cards.map((item, idx) => (
    <CardSlot
      key={normId((item as any)._id) || item.slug || item.code || idx}
      $cardWidth={cardWidth}
      $slotCount={slotCount}
    >
      <ReactionsCarouselCard item={item} lang={lang} myAll={myAll} />
    </CardSlot>
  ))}
</motion.div>

          </CarouselWindow>

          {canSlide && (
            <NavBtn onClick={goNext} aria-label="Sonraki" $side="right" tabIndex={0}>
              <MdArrowForwardIos size={28} />
            </NavBtn>
          )}
        </CarouselWrapper>
      </>
    );
  }

  return <Section>{content}</Section>;
}

/* ---------------- styles ---------------- */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  /* Alt boşluğu küçülttük */
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.lg};
  }
`;

const Header = styled.div`
  max-width: 1280px;
  margin: 0 auto ${({ theme }) => theme.spacings.md};
  padding: 0 ${({ theme }) => theme.spacings.xl};
  text-align: center;
`;

const SkeletonRow = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacings.xs};
`;

const SkelCard = styled(Skeleton)`
  height: 210px;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const CarouselWrapper = styled.div<{ $totalWidth: number }>`
  width: ${({ $totalWidth }) => $totalWidth}px;
  max-width: calc(100vw - 24px);
  min-width: 320px;
  margin: 0 auto;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;
  overflow: visible;
  padding: 0;
  box-sizing: border-box;

  @media (max-width: 700px) {
    width: 99vw !important;
    max-width: 99vw;
    min-height: 260px;
  }
`;

const CarouselWindow = styled.div<{
  $slotCount: number;
  $cardWidth: number;
  $gap: number;
}>`
  position: relative;
  width: ${({ $slotCount, $cardWidth, $gap }) =>
    $slotCount * $cardWidth + ($slotCount - 1) * $gap}px;
  max-width: 100vw;
  min-height: 220px;
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
  z-index: 2;
  overflow: hidden;

  @media (max-width: 700px) {
    width: 99vw !important;
    min-width: 220px;
    min-height: 180px;
    gap: 0;
    justify-content: center;
  }
`;

const FadeEdgeXLeft = styled.div<{ $fadeWidth: number }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${({ $fadeWidth }) => $fadeWidth}px;
  z-index: 8;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.sectionBackground};
  @media (max-width: 700px) {
    width: 32px;
  }
`;

const FadeEdgeXRight = styled(FadeEdgeXLeft)`
  left: auto;
  right: 0;
`;

// styled: CardSlot
const CardSlot = styled.div<{ $cardWidth: number; $slotCount: number }>`
  flex: 0 0 ${({ $cardWidth }) => $cardWidth}px;   /* 🔒 shrink/grow yok */
  width: ${({ $cardWidth }) => $cardWidth}px;
  min-width: ${({ $cardWidth }) => $cardWidth}px;
  max-width: ${({ $cardWidth }) => $cardWidth}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: width 0.19s;

  ${({ $slotCount }) =>
    $slotCount === 1 &&
    css`
      margin: 0 auto;
      flex: 0 0 96vw !important;
      width: 96vw !important;
      min-width: 220px;
      max-width: 99vw;
      justify-content: center;
      align-items: center;
    `}

  @media (max-width: 700px) {
    flex: 0 0 94vw !important;
    width: 94vw !important;
    min-width: 220px;
    max-width: 99vw;
    margin: 0 auto;
    justify-content: center;
    align-items: center;
  }
`;


const NavBtn = styled.button<{ $side?: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === "left" && css`
    left: 0;
  `}
  ${({ $side }) => $side === "right" && css`
    right: 0;
  `}
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 48px;
  height: 48px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 10px 0 ${({ theme }) => theme.colors.primaryTransparent};
  cursor: pointer;
  z-index: 22;
  transition: background 0.16s, color 0.14s, box-shadow 0.16s, border 0.16s;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 6px 24px 0 ${({ theme }) => theme.colors.primaryTransparent};
    border-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  @media (max-width: 700px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    min-width: 34px;
    min-height: 34px;
  }
`;
