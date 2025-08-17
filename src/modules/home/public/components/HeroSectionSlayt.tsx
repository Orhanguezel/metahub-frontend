"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import SkeletonBox from "@/shared/Skeleton";
import type { IGallery, IGalleryImage, GalleryCategory } from "@/modules/gallery/types";
import Modal from "./Modal";

const SLIDER_CATEGORY_SLUG = "carousel";

type Slide = {
  id: string;
  image: Pick<IGalleryImage, "url" | "thumbnail" | "webp"> | null;
  title: IGallery["title"];
  summary: IGallery["summary"];
  order: number;
  categoryId: string;
};

const HeroSectionSlayt = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { gallery, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory) as {
    categories: GalleryCategory[];
  };

  // hedef kategori
  const targetCategory = useMemo(
    () => categories?.find((cat) => cat.slug === SLIDER_CATEGORY_SLUG),
    [categories]
  );

  // galeri -> slide
  const slides = useMemo<Slide[]>(() => {
    if (!Array.isArray(gallery) || !targetCategory) return [];
    const filtered = gallery.filter((g) =>
      typeof g.category === "string"
        ? g.category === targetCategory._id
        : g.category?._id === targetCategory._id
    );

    return filtered
      .map((g) => {
        const first = g.images?.[0];
        return {
          id: g._id,
          image: first ? { url: first.url, thumbnail: first.thumbnail, webp: first.webp } : null,
          title: g.title,
          summary: g.summary,
          order: Number.isFinite(g.order) ? g.order : 0,
          categoryId: typeof g.category === "string" ? g.category : g.category?._id || "",
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [gallery, targetCategory]);

  const modal = useModal(slides);

  // oto slider
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => modal.next(), 5000);
    return () => clearInterval(timer);
  }, [slides, modal]);

  // klavye kontrolü (modalda)
  useEffect(() => {
    if (!modal.isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") modal.next();
      if (e.key === "ArrowLeft") modal.prev();
      if (e.key === "Escape") modal.close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modal]);

  const handleSwipe = useCallback(
    (e: React.TouchEvent) => {
      const startX = e.changedTouches[0].clientX;
      const handler = (endEvent: TouchEvent) => {
        const endX = endEvent.changedTouches[0].clientX;
        if (startX - endX > 50) modal.next();
        if (endX - startX > 50) modal.prev();
        window.removeEventListener("touchend", handler);
      };
      window.addEventListener("touchend", handler);
    },
    [modal]
  );

  if (loading) {
    return (
      <HeroWrapper>
        <SkeletonBox style={{ height: "60px", marginBottom: "24px" }} />
        <SkeletonBox style={{ height: "360px", width: "100%" }} />
      </HeroWrapper>
    );
  }

  if (slides.length === 0) {
    return <HeroWrapper>{t("noItemsFound", "No slider items found.")}</HeroWrapper>;
  }

  const hero = slides[modal.currentIndex];
  const title =
    hero?.title?.[lang]?.trim() ||
    hero?.title?.en?.trim() ||
    t("hero1.heroTitle", "Königs Masaj");

  const description =
    hero?.summary?.[lang]?.trim() ||
    hero?.summary?.en?.trim() ||
    t("hero1.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın");

  const imageSrc =
    hero?.image?.webp || hero?.image?.url || hero?.image?.thumbnail || "/placeholder.jpg";

  return (
    <>
      <HeroWrapper onTouchStart={handleSwipe}>
        <AnimatePresence mode="wait">
          <SlideBox
            key={modal.currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => modal.open(modal.currentIndex)}
          >
            <Background>
              <StyledImage src={imageSrc} alt={title || "Slider image"} fill priority />
              <Overlay />
            </Background>
            <Content>
              <HeroGlass>
                <Title>{title}</Title>
                <Subtitle>{description}</Subtitle>
              </HeroGlass>
            </Content>
          </SlideBox>
        </AnimatePresence>

        <Nav>
          {slides.map((_, idx) => (
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

      <Modal isOpen={modal.isOpen} onClose={modal.close} onNext={modal.next} onPrev={modal.prev}>
        <ModalContent>
          <ModalImageWrap>
            <Image
              src={imageSrc}
              alt={title || "Slider detail image"}
              width={1200}
              height={800}
              unoptimized
              sizes="100vw"
              style={{
                objectFit: "contain",
                maxHeight: "70vh",
                width: "auto",
                boxShadow: "0 8px 36px #e5549c33, 0 1.5px 10px #fbeaf0bb",
              }}
            />
          </ModalImageWrap>
          <ModalGlass>
            <h2>{title}</h2>
            <p>{description}</p>
          </ModalGlass>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HeroSectionSlayt;

/* ---------------- STYLED COMPONENTS ---------------- */

const HeroWrapper = styled.section`
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 0;
  margin: 0 auto;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  min-height: 540px;
  @media (max-width: 900px) {
    min-height: 320px;
  }
`;

const SlideBox = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 340px;
  min-height: 220px;
  max-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  @media (min-width: 768px) {
    height: 420px;
    min-height: 320px;
    max-height: 540px;
  }
  @media (min-width: 1200px) {
    height: 520px;
    max-height: 640px;
  }
  @media (max-width: 600px) {
    height: 180px;
    min-height: 110px;
    max-height: 240px;
  }
`;

const Background = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  aspect-ratio: 16/9;
  min-height: 100%;
  @media (max-width: 600px) {
    aspect-ratio: 16/9;
  }
`;

const StyledImage = styled(Image)`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: center;
  display: block;
  filter: brightness(0.7);
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: filter 0.18s;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 240, 246, 0.08) 0%,
    rgba(229, 84, 156, 0.16) 65%,
    rgba(82, 64, 75, 0.18) 100%
  );
  z-index: 2;
`;

const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform: translate(-50%, -50%);
  width: 92%;
  max-width: 720px;
  text-align: center;
`;

const HeroGlass = styled.div`
  background: rgba(255, 255, 255, 0.17);
  border: 2px solid ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 6px 38px #e5549c17, 0 1.5px 10px #fbeaf0bb;
  padding: 2.4rem 2.2rem 1.8rem 2.2rem;
  backdrop-filter: blur(10px) brightness(1.06);
  color: ${({ theme }) => theme.colors.primaryDark};
  max-width: 600px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 1.2rem 0.8rem;
    max-width: 98vw;
  }
  h2,
  h1 {
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }
  p {
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }
`;

const Nav = styled.div`
  position: absolute;
  left: 50%;
  bottom: 22px;
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

const ModalContent = styled.div`
  text-align: center;
  padding: 0;
  @media (max-width: 800px) {
    padding: 0 6px;
  }
`;

const ModalImageWrap = styled.div`
  margin: 0 auto 18px auto;
  max-width: 99vw;
  @media (max-width: 600px) {
    max-width: 98vw;
  }
`;

const ModalGlass = styled.div`
  background: rgba(255, 255, 255, 0.17);
  border: 2px solid ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 8px 32px #e5549c25, 0 2px 14px #fbeaf0aa;
  padding: 2.1rem 2.2rem 1.5rem 2.2rem;
  margin: 0 auto;
  max-width: 520px;
  margin-top: -10px;
  backdrop-filter: blur(9px) brightness(1.05);
  color: ${({ theme }) => theme.colors.primaryDark};
  @media (max-width: 600px) {
    padding: 1.1rem 0.6rem;
    max-width: 98vw;
  }
  h2,
  h1 {
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }
  p {
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
  letter-spacing: 0.01em;
  line-height: 1.13;
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  max-width: 96vw;
  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    padding: 0 6vw;
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0 0 ${({ theme }) => theme.spacings.lg} 0;
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.5;
  text-shadow: 0 2px 12px rgba(229, 84, 156, 0.08);
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  max-width: 95vw;
  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    padding: 0 8vw;
    max-width: 99vw;
  }
`;
