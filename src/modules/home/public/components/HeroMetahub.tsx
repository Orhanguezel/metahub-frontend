"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import SkeletonBox from "@/shared/Skeleton";
import type { IGallery } from "@/modules/gallery/types";
import useModal from "@/hooks/useModal";

const SLIDER_CATEGORY_SLUG = "carousel";
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQoU2NkQAP/Gf4zBgYGBqAEEzQwMDCQ8CkEAAAj3A7lRZefwAAAABJRU5ErkJggg=="; // 10x10px blur base64

type GalleryItem = IGallery["images"][0] & {
  _galleryId?: string;
  category?: any;
};

const HeroRobotic = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { publicImages, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);

  const targetCategory = useMemo(
    () => categories?.find((cat) => cat.slug === SLIDER_CATEGORY_SLUG),
    [categories]
  );

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

  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => modal.next(), 6200);
    return () => clearInterval(timer);
  }, [flatItems, modal]);

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

  if (loading) {
    return (
      <HeroWrapper>
        <SkeletonBox style={{ height: "52px", marginBottom: "18px" }} />
        <SkeletonBox style={{ height: "26px", width: "60%" }} />
        <SkeletonBox style={{ height: "36px", width: "40%", marginTop: "12px" }} />
      </HeroWrapper>
    );
  }
  if (!flatItems.length) {
    return (
      <HeroWrapper>
        <CenterContent>
          <Content>{t("noItemsFound", "No hero found.")}</Content>
        </CenterContent>
      </HeroWrapper>
    );
  }

  const heroItem = flatItems[modal.currentIndex];
  const title =
    heroItem?.name?.[lang] ||
    heroItem?.name?.["en"] ||
    t("hero.title", "Empowering The Future With AI & Robotics");
  const description =
    heroItem?.description?.[lang] ||
    heroItem?.description?.["en"] ||
    t("hero.desc", "Cutting-edge solutions for the new digital age.");

  const ctaLabel = t("hero.cta", "Explore Now");
  const ctaHref = "/contactme";

  return (
    <HeroWrapper onTouchStart={handleSwipe}>
      <AnimatePresence mode="wait">
        {flatItems.map((item, idx) =>
          idx === modal.currentIndex ? (
            <BgImage
              key={idx}
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <Image
                src={
                  item.webp ||
                  item.url ||
                  item.thumbnail ||
                  "/img/robot_reading.png"
                }
                alt="Background"
                fill
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                style={{
                  objectFit: "cover",
                  filter: "blur(1.5px) brightness(0.7) saturate(1.1)",
                  zIndex: 0,
                  pointerEvents: "none"
                }}
              />
              <GradientOverlay />
            </BgImage>
          ) : null
        )}
      </AnimatePresence>
      <CenterContent>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Actions>
            <CtaBtn href={ctaHref}>{ctaLabel}</CtaBtn>
          </Actions>
        </Content>
      </CenterContent>
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
    </HeroWrapper>
  );
};

export default HeroRobotic;

// --- Styled Components ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const HeroWrapper = styled.section`
  width: 100vw;
  min-height: 74vh;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BgImage = styled.div`
  position: absolute;
  inset: 0;
  width: 100vw;
  min-height: 74vh;
  aspect-ratio: 16/9;
  z-index: 0;
  animation: ${fadeIn} 1.2s;
  pointer-events: none;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(15, 45, 70, 0.55) 60%,
    #111a 100%
  );
  z-index: 2;
`;

const CenterContent = styled.div`
  position: relative;
  z-index: 5;
  width: 100vw;
  min-height: 74vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  text-align: center;
  max-width: 640px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: #2af6ff;
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 24px;
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  color: #fff;
  font-size: 1.36rem;
  font-weight: 400;
  margin-bottom: 36px;
  max-width: 98%;
  line-height: 1.55;
  word-break: break-word;
  overflow-wrap: anywhere;   // Özellikle mobilde uzun kelimeler için
  text-align: center;        // Ekstra: ortala
  @media (max-width: 600px) {
    font-size: 1.05rem;
    margin-bottom: 24px;
    max-width: 92vw;        // Mobilde kesinlikle taşmaz
    padding-left: 6vw;
    padding-right: 6vw;
  }
`;


const Actions = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 600px) {
    justify-content: center;
    width: 100%;
  }
`;

const CtaBtn = styled.a`
  background: #17f3ff;
  color: #02304c;
  font-size: 1.18rem;
  font-weight: 600;
  padding: 14px 36px;
  border-radius: 25px;
  text-decoration: none;
  box-shadow: 0 3px 16px 0 #0cf7ff38;
  border: none;
  cursor: pointer;
  transition: background 0.24s, color 0.17s, box-shadow 0.22s;
  letter-spacing: 0.02em;
  display: inline-block;

  &:hover,
  &:focus-visible {
    background: #00d2e0;
    color: #fff;
    box-shadow: 0 8px 32px 0 #00e5ff56;
    text-decoration: none;
  }
`;

const Nav = styled.div`
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
  z-index: 11;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#17f3ff" : "#1d313a")};
  border: ${({ $active }) => ($active ? "3px solid #18b3e6" : "none")};
  box-shadow: ${({ $active }) =>
    $active ? "0 3px 14px 0 #17f3ff48" : "none"};
  cursor: pointer;
  transition: background 0.3s, border 0.22s;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 3px #17f3ff77;
    border: 2px solid #18b3e6;
  }
`;
