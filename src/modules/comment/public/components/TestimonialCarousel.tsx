import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import TestimonialCard from "./TestimonialCard";
import styled, { css } from "styled-components";

// Sabitler
const CARD_WIDTH_DESKTOP = 360;
const CARD_WIDTH_MOBILE = 320;
const GAP = 16;
const FADE_WIDTH = 56;
const NAV_BTN_WIDTH = 48;

function getSlotCount(width: number) {
  return width < 700 ? 1 : 3;
}
function getCardWidth(width: number) {
  return width < 700 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
}

export default function TestimonialCarousel({
  cards,
  x,
  animKey,
  isSliding,
  onPrev,
  onNext,
  onAnimationComplete,
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
  // Responsive görünüm için slotCount ve cardWidth
  const [slotCount, setSlotCount] = useState(3);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setSlotCount(getSlotCount(width));
      setCardWidth(getCardWidth(width));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Genişlik sadece slotCount’a göre!
  const TOTAL_WIDTH =
    cardWidth * slotCount + GAP * (slotCount - 1) + 2 * NAV_BTN_WIDTH;

  return (
    <CarouselWrapper $totalWidth={TOTAL_WIDTH}>
      <FadeEdgeXLeft $fadeWidth={FADE_WIDTH} />
      <FadeEdgeXRight $fadeWidth={FADE_WIDTH} />
      <NavBtn onClick={onPrev} aria-label="Önceki" $side="left" tabIndex={0}>
        <MdArrowBackIos size={28} />
      </NavBtn>
      <CarouselWindow $slotCount={slotCount} $cardWidth={cardWidth} $gap={GAP}>
        <motion.div
          key={animKey}
          style={{
            display: "flex",
            gap: `${GAP}px`,
            minHeight: 0,
            position: "relative",
            left: 0,
            width: `calc(${cardWidth * cards.length + GAP * (cards.length - 1)}px)`, // burada animasyon için cards.length!
          }}
          animate={{ x }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onAnimationComplete={isSliding ? onAnimationComplete : undefined}
        >
          {cards.map((card, idx) => (
            <CardSlot key={card._id || idx} $cardWidth={cardWidth} $slotCount={slotCount}>
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

// --- Styled Components ---

const CarouselWrapper = styled.div<{ $totalWidth: number }>`
  width: ${({ $totalWidth }) => $totalWidth}px;
  max-width: calc(100vw - 24px); // 24px padding için
  min-width: 320px;
  margin: 0 auto;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;
  overflow: visible;
  padding: 0 0;
  box-sizing: border-box;

  @media (max-width: 700px) {
    width: 99vw !important;
    max-width: 99vw;
    min-height: 260px;
    padding: 0 0;
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

  z-index: 2;
  overflow: hidden; // Anahtar satır: taştığında taşanı gösterme
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

const FadeEdgeXRight = styled.div<{ $fadeWidth: number }>`
  position: absolute;
  right: 0;
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

const CardSlot = styled.div<{ $cardWidth: number, $slotCount: number }>`
  width: ${({ $cardWidth }) => $cardWidth}px;
  min-width: ${({ $cardWidth }) => $cardWidth}px;
  max-width: ${({ $cardWidth }) => $cardWidth}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: width 0.19s;
  ${({ $slotCount }) => $slotCount === 1 && css`
    margin: 0 auto;
    width: 96vw !important;
    min-width: 220px;
    max-width: 99vw;
    justify-content: center;
    align-items: center;
  `}
  @media (max-width: 700px) {
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
  transition:
    background 0.16s,
    color 0.14s,
    box-shadow 0.16s,
    border 0.16s;
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
