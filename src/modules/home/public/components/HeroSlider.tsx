"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import Modal from "./Modal";
import { SupportedLocale } from "@/types/common";
import { FaArrowLeft, FaArrowRight, FaExpand } from "react-icons/fa";
import SkeletonBox from "@/shared/Skeleton";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import Link from "next/link";
import type { IGallery, IGalleryImage, GalleryCategory } from "@/modules/gallery/types";

const SLIDER_CATEGORY_SLUG = "carousel";

type Slide = {
  id: string;
  title: IGallery["title"];
  summary: IGallery["summary"];
  slug?: string;
  image: Pick<IGalleryImage, "url" | "thumbnail" | "webp"> | null;
  order: number;
};

const HeroSlider = () => {
  const { gallery, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory) as {
    categories: GalleryCategory[];
  };

  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // --- Pick category by slug ---
  const selectedCategoryId = useMemo(() => {
    if (!SLIDER_CATEGORY_SLUG || !Array.isArray(categories)) return "";
    const cat = categories.find((c) => c.slug === SLIDER_CATEGORY_SLUG);
    return cat?._id || "";
  }, [categories]);

  // --- Map galleries to slides ---
  const slides = useMemo<Slide[]>(() => {
    if (!selectedCategoryId || !Array.isArray(gallery)) return [];
    return gallery
      .filter((g: IGallery) =>
        typeof g.category === "string"
          ? g.category === selectedCategoryId
          : g.category?._id === selectedCategoryId
      )
      .map((g) => {
        const first = g.images?.[0];
        return {
          id: g._id,
          title: g.title,
          summary: g.summary,
          slug: g.slug,
          image: first ? { url: first.url, thumbnail: first.thumbnail, webp: first.webp } : null,
          order: Number.isFinite(g.order) ? g.order : 0,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [gallery, selectedCategoryId]);

  // --- Modal hook ---
  const { isOpen, open, close, next, prev, currentIndex, currentItem, setIndex } = useModal(slides);

  // --- Auto slider (pause while interacting or modal open) ---
  const [isInteracting, setIsInteracting] = useState(false);
  useEffect(() => {
    if (slides.length === 0 || isOpen || isInteracting) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, setIndex, isOpen, isInteracting]);

  // --- Keyboard in modal ---
  useEffect(() => {
    if (!isOpen) return;
    const handleModalKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleModalKey);
    return () => window.removeEventListener("keydown", handleModalKey);
  }, [isOpen, next, prev, close]);

  /* =========================================================
   *  !!! ÖNEMLİ: Tüm useRef kancaları koşullu return'lerden önce
   *  ========================================================= */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const deltaX = useRef(0);
  const dragging = useRef(false);

  // --- Loading & empty ---
  if (loading) {
    return (
      <HeroWrapper>
        <SkeletonBox style={{ height: "60px", marginBottom: "24px" }} />
        <SkeletonBox style={{ height: "360px", width: "100%" }} />
      </HeroWrapper>
    );
  }
  if (slides.length === 0) {
    return <HeroWrapper>{t("noItemsFound", "No products found.")}</HeroWrapper>;
  }

  // --- Active slide ---
  const currentSlide = slides[currentIndex];

  const title =
    currentSlide?.title?.[lang] ||
    currentSlide?.title?.en ||
    t("hero1.heroTitle", "Königs Masaj");

  const description =
    currentSlide?.summary?.[lang] ||
    currentSlide?.summary?.en ||
    t("hero1.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın");

  let imageSrc =
    currentSlide?.image?.webp ||
    currentSlide?.image?.url ||
    currentSlide?.image?.thumbnail ||
    "/placeholder.jpg";

  if (typeof imageSrc === "string" && imageSrc.startsWith("https://res.cloudinary.com/")) {
    imageSrc = `${imageSrc}?w=900&h=600&c_fill&q_auto,f_auto`;
  }

  const detailLink = currentSlide?.slug ? `/gallery/${currentSlide.slug}` : `/gallery`;

  // === Touch / Pointer swipe handlers (no external libs) ===
  const begin = (x: number, y: number) => {
    dragging.current = true;
    setIsInteracting(true);
    startX.current = x;
    startY.current = y;
    deltaX.current = 0;
  };
  const move = (x: number, y: number) => {
    if (!dragging.current) return;
    const dx = x - startX.current;
    const dy = y - startY.current;
    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      deltaX.current = dx;
    } else {
      deltaX.current = 0;
    }
  };
  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const width = containerRef.current?.offsetWidth || 1;
    const threshold = Math.min(90, width * 0.15);
    const dx = deltaX.current;
    deltaX.current = 0;
    setIsInteracting(false);
    if (Math.abs(dx) >= threshold) {
      if (dx < 0) next();
      else prev();
    }
  };
  const cancel = () => {
    dragging.current = false;
    deltaX.current = 0;
    setIsInteracting(false);
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    begin(t.clientX, t.clientY);
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    move(t.clientX, t.clientY);
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => end();
  const onTouchCancel: React.TouchEventHandler<HTMLDivElement> = () => cancel();

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === "mouse" && e.buttons !== 1) return;
    begin(e.clientX, e.clientY);
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    move(e.clientX, e.clientY);
  };
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = () => end();
  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = () => cancel();

  return (
    <>
      <HeroWrapper>
        <ImageCol
          ref={containerRef}
          // Touch
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
          // Pointer (mouse/pen/trackpad)
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          aria-roledescription="carousel"
          aria-label="Hero slider"
        >
          <MainImage
            src={imageSrc}
            alt={title}
            fill
            priority
            sizes="60vw"
            quality={90}
            style={{ objectFit: "cover" }}
          />
          <DotRow>
            {slides.map((_, index) => (
              <Dot
                key={index}
                $active={index === currentIndex}
                onClick={() => setIndex(index)}
                tabIndex={0}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </DotRow>
        </ImageCol>

        <ContentCol>
          <HeroTitle as="h1">{title}</HeroTitle>
          <HeroDesc>{description}</HeroDesc>

          <SliderControls>
            <ControlButton onClick={prev} aria-label="Previous">
              <FaArrowLeft />
            </ControlButton>
            <ControlButton onClick={next} aria-label="Next">
              <FaArrowRight />
            </ControlButton>
            <ControlButton onClick={() => open(currentIndex)} aria-label="Expand">
              <FaExpand />
            </ControlButton>

            <StyledLink href={detailLink}>
              {t("hero.products", "Ürünler")}
            </StyledLink>
          </SliderControls>
        </ContentCol>
      </HeroWrapper>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={close} onNext={next} onPrev={prev}>
        <ModalContent>
          <Image
            src={imageSrc}
            alt={title}
            width={920}
            height={560}
            style={{
              objectFit: "contain",
              width: "100%",
              maxHeight: "80vh",
              borderRadius: "18px",
              background: "#fff",
            }}
          />
          <ModalTitle>{currentItem?.title?.[lang] || currentItem?.title?.en}</ModalTitle>
          <ModalDesc>{currentItem?.summary?.[lang] || currentItem?.summary?.en}</ModalDesc>
          <DotRow style={{ marginTop: "10px" }}>
            {slides.map((_, index) => (
              <Dot key={index} $active={index === currentIndex} />
            ))}
          </DotRow>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HeroSlider;

/* ---------------- Styled ---------------- */

const HeroWrapper = styled.section`
  display: flex;
  align-items: stretch;
  justify-content: center;
  min-height: 460px;
  width: 100vw;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.title};
  gap: 0;
  position: relative;
  @media (max-width: 1100px) {
    flex-direction: column;
    min-height: 380px;
  }
  @media (max-width: 600px) {
    min-height: 260px;
  }
`;

const ImageCol = styled.div`
  flex: 1.3;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  overflow: hidden;
  aspect-ratio: 16/9;
  min-height: 340px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  touch-action: pan-y; /* allow vertical scroll; we handle horizontal swipe */
  @media (max-width: 1100px) {
    min-height: 210px;
    aspect-ratio: 16/9;
    margin-right: 0;
  }
  @media (max-width: 600px) {
    min-height: 172px;
  }
`;

const MainImage = styled(Image)`
  position: absolute !important;
  left: 0;
  top: 0;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: filter 0.16s;
  filter: blur(0.2px);
`;

const DotRow = styled.div`
  display: flex;
  gap: 8px;
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  @media (max-width: 1100px) {
    bottom: 9px;
    gap: 6px;
  }
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 17px;
  height: 17px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent : theme.colors.skeleton};
  border: 2.5px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  transition: background 0.21s, border 0.22s;
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.md : "none")};
  cursor: pointer;
  outline: none;
`;

const ContentCol = styled.div`
  flex: 1;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
  background: transparent;
  @media (max-width: 1100px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.md};
    align-items: center;
    text-align: center;
    gap: 15px;
    min-width: 0;
    width: 100%;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.01em;
  margin-bottom: 2px;
  text-shadow: 0 3px 16px rgba(40, 117, 194, 0.22);
`;

const HeroDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(30, 80, 160, 0.09);
  margin-bottom: 18px;
  max-width: 94%;
  word-break: break-word;
  overflow-wrap: anywhere;
  text-align: left;
  hyphens: auto;
  @media (max-width: 1100px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    max-width: 96vw;
    text-align: center;
    padding-left: 7vw;
    padding-right: 7vw;
  }
`;

const SliderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 7px;
  @media (max-width: 1100px) {
    gap: 7px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ControlButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  padding: 9px;
  width: 40px;
  height: 40px;
  font-size: 1.22rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background 0.19s, color 0.18s, box-shadow 0.18s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const StyledLink = styled(Link)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  padding: 11px 32px;
  margin-left: 18px;
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.18s, color 0.16s;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
  }
  @media (max-width: 1100px) {
    margin-left: 0;
    margin-top: 14px;
    width: 100%;
    justify-content: center;
  }
`;

const ModalContent = styled.div`
  text-align: center;
  padding: 22px 12px;
  max-width: 98vw;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-top: 16px;
`;

const ModalDesc = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-top: 8px;
  text-shadow: 0 2px 10px rgba(30, 80, 160, 0.08);
`;
