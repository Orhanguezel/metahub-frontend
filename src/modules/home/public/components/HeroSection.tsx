"use client";

import Link from "next/link";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchGalleryItems } from "@/modules/gallery/slice/gallerySlice";
import { fetchGalleryCategories } from "@/modules/gallery/slice/galleryCategorySlice";

export default function HeroSection() {
  const { t, i18n } = useTranslation("home");
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.gallery);
  const [flatItems, setFlatItems] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    dispatch(fetchGalleryCategories());
    // burada "hero" slug veya id olmalı! string olması gerekirse id'yi çek.
    dispatch(fetchGalleryItems({ category: "hero", published: true }));
  }, [dispatch]);

  useEffect(() => {
    // Flat gallery mantığı: sadece görselleri tek diziye indir
    if (items.length > 0) {
      const merged = items.flatMap((item) => item.items || []);
      setFlatItems(merged);
    }
  }, [items]);

  // Slider otomatik kaydırma
  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % flatItems.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [flatItems]);

  // Dots veya ok ile manuel geçiş
  const goTo = (idx: number) => setCurrent(idx);

  const backgroundImage =
    flatItems[current]?.webp ||
    flatItems[current]?.image ||
    flatItems[current]?.thumbnail ||
    "/placeholder.jpg";

  const title =
    flatItems[current]?.title?.[i18n.language] ||
    t("hero1.heroTitle", "Königs Masaj");
  const description =
    flatItems[current]?.description?.[i18n.language] ||
    t("hero1.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın");

  return (
    <Hero>
      <AnimatePresence mode="wait">
        <BackgroundImageWrapper key={current}>
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: [0.42, 0, 0.58, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StyledImage
              src={backgroundImage}
              alt={title}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </BackgroundImageWrapper>
      </AnimatePresence>
      <Overlay />
      <SliderContent>
        <HeroCard>
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {title}
          </motion.h1>
          <motion.p
            key={description}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {description}
          </motion.p>
          <Link href="/booking" passHref legacyBehavior>
            <CTAButton as="a">
              {t("hero.bookAppointment", "Randevu Al")}
            </CTAButton>
          </Link>
        </HeroCard>
        <Dots>
          {flatItems.map((_, idx) => (
            <Dot
              key={idx}
              $active={idx === current}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </Dots>
      </SliderContent>
    </Hero>
  );
}

// === STYLES ===

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 72vh;
  min-height: 420px;
  max-height: 760px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  @media ${({ theme }) => theme.media.mobile} {
    min-height: 320px;
    height: 45vh;
  }
`;

const BackgroundImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.42) 0%,
    rgba(0, 0, 0, 0.64) 100%
  );
  z-index: 1;
`;

const SliderContent = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing.xxl};

  @media ${({ theme }) => theme.media.mobile} {
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const HeroCard = styled.div`
  background: rgba(255,255,255,0.07);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 620px;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};
  backdrop-filter: blur(2px);

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.extraBold};
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    letter-spacing: 0.01em;
    line-height: 1.15;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    font-family: ${({ theme }) => theme.fonts.body};
    line-height: 1.4;
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    h1 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
    p { font-size: ${({ theme }) => theme.fontSizes.md}; }
  }
`;

const CTAButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.normal}, color ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    text-decoration: none;
  }
`;

const Dots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  align-items: center;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ theme }) => theme.spacing.lg};
  height: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  border: none;
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.sm : "none")};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};
  outline: none;

  &:focus {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;
