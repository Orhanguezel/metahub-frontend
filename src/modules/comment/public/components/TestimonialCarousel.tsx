import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import TestimonialCard from "./TestimonialCard";
import styled, { css } from "styled-components";

// Sabitler
const CARD_WIDTH_DESKTOP = 360;
const CARD_WIDTH_MOBILE  = 320;
const GAP = 16;
const FADE_WIDTH = 56;
const NAV_BTN_WIDTH = 48;

// Mobil kart: tam satır değil (~%88 vw)
const MOBILE_CARD_VW = 88;
const MOBILE_MIN_PX  = 240;
const MOBILE_MAX_PX  = 520;

const getSlotCount = (w: number) => (w < 700 ? 1 : 3);
const getCardWidth = (w: number) => (w < 700 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function TestimonialCarousel({
  cards,
  x,                // parent: negatif → next, pozitif → prev, 0 → idle
  animKey,          // prop kalsın; REMOUNT ETMİYORUZ
  isSliding,
  onPrev,
  onNext,
  onAnimationComplete, // parent: window slice, setX(0), setIsSliding(false)
  lang,
}: {
  cards: any[];
  x: number;
  animKey: number;
  isSliding: boolean;
  onPrev: () => void;
  onNext: () => void;
  onAnimationComplete: () => void;
  lang: string;
}) {
  // Responsive
  const [slotCount, setSlotCount] = useState(3);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP);
  const [viewportW, setViewportW] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewportW(w);
      setSlotCount(getSlotCount(w));
      setCardWidth(getCardWidth(w));
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = slotCount === 1;

  // Mobil kart genişliği (px) — tam satır değil
  const mobileCardPx = Math.round((viewportW * MOBILE_CARD_VW) / 100);
  const effectiveCard = isMobile
    ? clamp(mobileCardPx, MOBILE_MIN_PX, MOBILE_MAX_PX)
    : cardWidth;

  // Gap: mobilde 0
  const gapPx = isMobile ? 0 : GAP;

  // Adım: kart + gap
  const step = Math.round(effectiveCard + gapPx);

  // x → sadece yön
  const xTarget = x === 0 ? 0 : x < 0 ? -step : step;

  // Track ve wrapper (hesaplanmış)
  const computedTrackWidth = Math.round(
    effectiveCard * cards.length + gapPx * (cards.length - 1)
  );
  const TOTAL_WIDTH = Math.round(
    effectiveCard * slotCount + gapPx * (slotCount - 1) + 2 * NAV_BTN_WIDTH
  );

  // === Zıplamayı önlemek için track genişliğini animasyon boyunca KİLİTLE ===
  const stableTrackWidthRef = useRef(computedTrackWidth);
  useEffect(() => {
    if (isSliding) {
      // animasyon başlarken geçerli genişliği kilitle
      stableTrackWidthRef.current = computedTrackWidth;
    }
  }, [isSliding, computedTrackWidth]);

  const trackWidthPx = isSliding ? stableTrackWidthRef.current : computedTrackWidth;

  // --- Peek-complete + anında geri dönüş (snap)
  const calledRef = useRef(false);
  const snapRef = useRef(false);

  useEffect(() => {
    // Yeni kaydırma başlarken resetle
    if (isSliding) {
      calledRef.current = false;
      snapRef.current = false;
    }
  }, [isSliding]);

  const handleUpdate = useCallback(
    (latest: { x?: number; transform?: string }) => {
      if (!isSliding || calledRef.current) return;

      const curX =
        typeof latest?.x === "number"
          ? latest.x
          : typeof latest?.transform === "string"
          ? parseFloat(String(latest.transform).match(/-?\d+(\.\d+)?(?=px)/)?.[0] ?? "0")
          : 0;

      const thresh = Math.max(1, Math.abs(xTarget) * 0.98); // %98 veya min 1px

      if ((xTarget < 0 && curX <= -thresh) || (xTarget > 0 && curX >= thresh)) {
        calledRef.current = true;
        // Sonraki render'da x=0 dönüşünü animasyonsuz (snap) yap
        snapRef.current = true;
        onAnimationComplete();
      }
    },
    [isSliding, xTarget, onAnimationComplete]
  );

  // isSliding=false olduğunda (ve az önce tamamladık) → x=0'a transition=0 ile dön
  const transition =
    isSliding
      ? { duration: 0.5, ease: "easeInOut" }
      : snapRef.current
      ? { duration: 0 }
      : { duration: 0 };

  return (
    <CarouselWrapper $totalWidth={TOTAL_WIDTH}>
      <FadeEdgeXLeft  $fadeWidth={FADE_WIDTH} />
      <FadeEdgeXRight $fadeWidth={FADE_WIDTH} />

      <NavBtn onClick={onPrev} aria-label="Önceki" $side="left" tabIndex={0}>
        <MdArrowBackIos size={28} />
      </NavBtn>

      <CarouselWindow $slotCount={slotCount} $cardWidth={effectiveCard} $gap={gapPx}>
        <motion.div
          data-animkey={animKey} 
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: `${gapPx}px`,
            minHeight: 0,
            position: "relative",
            left: 0,
            width: `${trackWidthPx}px`,   // ← animasyon boyunca SABİT
            willChange: "transform",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
          animate={{ x: xTarget }}
          transition={transition}
          onUpdate={handleUpdate}
        >
          {cards.map((card, idx) => (
            <CardSlot key={card._id || idx} $cardWidth={effectiveCard} $slotCount={slotCount}>
              <TestimonialCard
                card={card}
                lang={lang}
                isActive={cards.length === 1 ? true : Math.floor(cards.length / 2) === idx}
              />
            </CardSlot>
          ))}
        </motion.div>
      </CarouselWindow>

      <NavBtn onClick={onNext} aria-label="Sonraki" $side="right" tabIndex={0}>
        <MdArrowForwardIos size={28} />
      </NavBtn>
    </CarouselWrapper>
  );
}

/* ---------------- styles ---------------- */

const CarouselWrapper = styled.div<{ $totalWidth: number }>`
  width: ${({ $totalWidth }) => $totalWidth}px;
  max-width: calc(100vw - 24px);
  min-width: 320px;
  margin: 0 auto;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;
  overflow: visible;
  padding: 0;
  box-sizing: border-box;

  @media (max-width: 700px) {
    max-width: 92vw;
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
  min-height: 320px;
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
  z-index: 2;
  overflow: hidden;

  @media (max-width: 700px) {
    width: 92vw !important;
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

const CardSlot = styled.div<{ $cardWidth: number; $slotCount: number }>`
  flex: 0 0 ${({ $cardWidth }) => $cardWidth}px;  /* grow/shrink yok */
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
      justify-content: center;
      align-items: center;
    `}
`;

const NavBtn = styled.button<{ $side?: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === "left" && css`left: 0;`}
  ${({ $side }) => $side === "right" && css`right: 0;`}
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

export { CardSlot };
