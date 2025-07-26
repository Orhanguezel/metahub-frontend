"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import SkeletonBox from "@/shared/Skeleton";
import type { IGallery } from "@/modules/gallery/types";
import useModal from "@/hooks/useModal";

const SLIDER_CATEGORY_SLUG = "carousel";

type GalleryItem = IGallery["images"][0] & {
  _galleryId?: string;
  category?: any;
};

const HeroRobotic = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { publicImages, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);

  // İlgili kategoriyi bul
  const targetCategory = useMemo(
    () => categories?.find((cat) => cat.slug === SLIDER_CATEGORY_SLUG),
    [categories]
  );

  // İlgili kategorideki TUM görselleri flat array olarak al
  const flatItems = useMemo<GalleryItem[]>(() => {
    if (!Array.isArray(publicImages) || !targetCategory) return [];
    const filtered = publicImages.filter((gallery) =>
      typeof gallery.category === "string"
        ? gallery.category === targetCategory._id
        : gallery.category?._id === targetCategory._id
    );
    const allImages: GalleryItem[] = [];
    filtered.forEach((gallery) => {
      (gallery.images || []).forEach((img) => {
        allImages.push({
          ...img,
          _galleryId: gallery._id,
          category: gallery.category,
        });
      });
    });
    allImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return allImages;
  }, [publicImages, targetCategory]);

  const modal = useModal(flatItems);

  // Oto slider
  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => modal.next(), 5800);
    return () => clearInterval(timer);
  }, [flatItems, modal]);

  // Swipe support (mobil)
  const handleSwipe = useCallback((e: React.TouchEvent) => {
    const startX = e.changedTouches[0].clientX;
    const handler = (endEvent: TouchEvent) => {
      const endX = endEvent.changedTouches[0].clientX;
      if (startX - endX > 50) modal.next();
      if (endX - startX > 50) modal.prev();
      window.removeEventListener("touchend", handler);
    };
    window.addEventListener("touchend", handler);
  }, [modal]);

  // Loading ve boş durum
  if (loading) {
    return (
      <HeroSectionWrapper>
        <SkeletonBox style={{ height: "52px", marginBottom: "18px" }} />
        <SkeletonBox style={{ height: "26px", width: "60%" }} />
        <SkeletonBox style={{ height: "36px", width: "40%", marginTop: "12px" }} />
      </HeroSectionWrapper>
    );
  }
  if (!flatItems.length) {
    return (
      <HeroSectionWrapper>
        <Content>{t("noItemsFound", "No hero found.")}</Content>
      </HeroSectionWrapper>
    );
  }

  // Aktif slide
  const heroItem = flatItems[modal.currentIndex];
  const title =
    heroItem?.name?.[lang] ||
    heroItem?.name?.["en"] ||
    t("hero.title", "Empowering The Future With AI & Robotics");
  const description =
    heroItem?.description?.[lang] ||
    heroItem?.description?.["en"] ||
    t("hero.desc", "Cutting-edge solutions for the new digital age.");
  const imageSrc =
    heroItem?.webp ||
    heroItem?.url ||
    heroItem?.thumbnail ||
    "/img/robot_reading.png";

  // CTA
  const ctaLabel = t("hero.cta", "Explore Now");
  const ctaHref = "/about";

  return (
    <HeroSectionWrapper onTouchStart={handleSwipe}>
      <AnimatePresence mode="wait">
        <Slide
          key={modal.currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Content>
            <Title>{title}</Title>
            <Description>{description}</Description>
            <Actions>
              <CtaBtn href={ctaHref}>{ctaLabel}</CtaBtn>
            </Actions>
          </Content>
          <HeroImageWrapper>
            <Image
              src={imageSrc}
              alt={heroItem?.name?.[lang] || "Hero Image"}
              width={480}
              height={480}
              style={{ objectFit: "contain", width: "100%", height: "auto" }}
              priority
            />
          </HeroImageWrapper>
        </Slide>
      </AnimatePresence>
      <Nav>
        {flatItems.map((_, idx) => (
          <Dot
            key={idx}
            $active={idx === modal.currentIndex}
            onClick={() => modal.open(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            tabIndex={0}
          />
        ))}
      </Nav>
    </HeroSectionWrapper>
  );
};

export default HeroRobotic;

// --- Styled Components ---
const HeroSectionWrapper = styled.section`
  width: 100%;
  background: radial-gradient(
    circle at center,
    ${({ theme }) => `${theme.colors.backgroundSecondary}CC`} 0%,
    #000 100%
  );
  position: relative;
  min-height: 68vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Slide = styled(motion.div)`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl} 0;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    padding: ${({ theme }) => theme.spacings.lg} 0;
  }
`;

const Content = styled.div`
  z-index: 2;
  max-width: 630px;
  width: 100%;
  padding-left: ${({ theme }) => theme.spacings.xxxl};
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 900px) {
    align-items: center;
    padding-left: 0;
    padding-right: 0;
    max-width: 100%;
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacings.xl};
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.title};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  letter-spacing: 0.01em;

  @media (max-width: 900px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  max-width: 94%;

  @media (max-width: 900px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    margin-bottom: ${({ theme }) => theme.spacings.md};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start;

  @media (max-width: 900px) {
    justify-content: center;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;

const CtaBtn = styled.a`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 15px 40px;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};
  letter-spacing: 0.01em;
  display: inline-block;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
  }
`;

const HeroImageWrapper = styled.div`
  flex: 1;
  min-width: 240px;
  max-width: 480px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (max-width: 900px) {
    max-width: 340px;
    width: 100%;
    margin-bottom: 0;
    align-items: center;
    justify-content: center;
    margin-top: ${({ theme }) => theme.spacings.lg};
  }
`;

const Nav = styled.div`
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  z-index: 5;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ theme }) => theme.spacings.lg};
  height: ${({ theme }) => theme.spacings.lg};
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  border: ${({ $active, theme }) =>
    $active ? `2.5px solid ${theme.colors.primaryDark}` : "none"};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.md : "none")};
  cursor: pointer;
  transition: background 0.3s, border 0.22s;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTransparent};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;
