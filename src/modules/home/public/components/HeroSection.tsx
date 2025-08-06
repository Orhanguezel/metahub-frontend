"use client";

import Link from "next/link";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import type { IGallery, IGalleryCategory } from "@/modules/gallery/types";
import Modal from "./Modal"; // Kendi Modal bileşenin olacak

const HERO_CATEGORY_SLUG = "carousel";

const HeroSection = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { publicImages } = useAppSelector((state) => state.gallery);
  const galleryCategories = useAppSelector((state) => state.galleryCategory.categories);

  const selectedCategoryId = useMemo(() => {
    const cat = galleryCategories.find((c: IGalleryCategory) => c.slug === HERO_CATEGORY_SLUG);
    return cat?._id || "";
  }, [galleryCategories]);

  const flatItems = useMemo(() => {
    if (!selectedCategoryId || !Array.isArray(publicImages)) return [];
    const filteredGalleries = publicImages.filter((item: IGallery) =>
      typeof item.category === "string"
        ? item.category === selectedCategoryId
        : item.category?._id === selectedCategoryId
    );
    const allImages: any[] = [];
    filteredGalleries.forEach((gallery) => {
      (gallery.images || []).forEach((img) => {
        allImages.push({
          ...img,
          _galleryId: gallery._id,
        });
      });
    });
    allImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return allImages;
  }, [publicImages, selectedCategoryId]);

  const [current, setCurrent] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);

  const enableSlider = flatItems.length > 1;
  const currentHero = flatItems[current];

  const backgroundImage =
    currentHero?.webp || currentHero?.url || currentHero?.thumbnail || "/placeholder.jpg";

  const title =
    currentHero?.name?.[lang]?.trim() ||
    t("hero1.heroTitle", "Königs Masaj");

  const description =
    currentHero?.description?.[lang]?.trim() ||
    t("hero1.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın");

  // Slide/Language değişince sıfırla
  useEffect(() => {
    setCurrent(0);
  }, [lang, flatItems.length]);

  // Otomatik kaydırıcı
  useEffect(() => {
    if (!enableSlider) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % flatItems.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [enableSlider, flatItems.length]);

  // --- MODAL Navigation ---
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  // Klavye navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") handleModalClose();
      if (e.key === "ArrowRight") setCurrent((prev) => (prev + 1) % flatItems.length);
      if (e.key === "ArrowLeft")
        setCurrent((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    },
    [isModalOpen, flatItems.length]
  );

  useEffect(() => {
    if (!isModalOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleKeyDown]);

  return (
    <Hero>
      <AnimatePresence mode="wait">
        <BackgroundImageWrapper key={current}>
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <StyledImage
              src={backgroundImage}
              alt={title || "Hero background image"}
              fill
              priority
              style={{ objectFit: "cover", cursor: "pointer" }}
              onClick={handleModalOpen}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleModalOpen();
              }}
              aria-label="Detaylı gör"
              role="button"
            />
          </motion.div>
        </BackgroundImageWrapper>
      </AnimatePresence>
      <Overlay />
      <SliderContent>
        <HeroCard
          as={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.95 }}
        >
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <GradientTitle>{title}</GradientTitle>
          </motion.h1>
          <motion.p
            key={description}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <HeroDesc>{description}</HeroDesc>
          </motion.p>
          <Link href="/booking">
            <CTAButton as="span">
              {t("hero.bookAppointment", "Randevu Al")}
            </CTAButton>
          </Link>
        </HeroCard>
        <Dots>
          {flatItems.map((_, idx) => (
            <Dot
              key={idx}
              $active={idx === current}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </Dots>
      </SliderContent>

      {/* MODAL */}
  <Modal
    isOpen={isModalOpen}
    onClose={handleModalClose}
    onNext={enableSlider ? () => setCurrent((prev) => (prev + 1) % flatItems.length) : undefined}
    onPrev={enableSlider ? () => setCurrent((prev) => (prev - 1 + flatItems.length) % flatItems.length) : undefined}
  >
    <ModalContent>
      <ModalImage
        src={backgroundImage}
        alt={title}
        fill
        priority
        style={{ objectFit: "contain", background: "#fff" }}
      />
      <ModalCaption>
        <h3>{title}</h3>
        <p>{description}</p>
      </ModalCaption>
    </ModalContent>
  </Modal>
    </Hero>
  );
};

export default HeroSection;

// ----------- STYLED COMPONENTS --------------

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 72vh;
  min-height: 420px;
  max-height: 760px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 900px) {
    min-height: 320px;
    height: 50vh;
    max-height: 600px;
    padding-bottom: ${({ theme }) => theme.spacings.lg};
  }
  @media (max-width: 600px) {
    min-height: 210px;
    height: 45vh;
    max-height: 380px;
    padding-bottom: ${({ theme }) => theme.spacings.md};
  }
`;


const BackgroundImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  aspect-ratio: 16/9;
  min-height: 320px;
  @media (max-width: 600px) {
    min-height: 210px;
    aspect-ratio: 16/9;
  }
`;

const StyledImage = styled(Image)`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.cardBackground};
  cursor: pointer;
  transition: filter 0.16s;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const SliderContent = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.colors.whiteColor};
  padding-bottom: ${({ theme }) => theme.spacings.xxl};

  @media (max-width: 900px) {
    padding-bottom: ${({ theme }) => theme.spacings.lg};
  }
  @media (max-width: 600px) {
    padding-bottom: ${({ theme }) => theme.spacings.md};
  }
`;

const HeroCard = styled.div`
  background: rgba(255,255,255,0.12);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.xxl};
  box-shadow: 0 8px 40px 0 rgba(229,84,156,0.10), ${({ theme }) => theme.shadows.lg};
  max-width: 620px;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};
  backdrop-filter: blur(8px) saturate(110%) brightness(1.04);
  border: 2.5px solid ${({ theme }) => theme.colors.primaryLight};

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    font-weight: ${({ theme }) => theme.fontWeights.extraBold};
    margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
    letter-spacing: 0.01em;
    line-height: 1.13;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0 0 ${({ theme }) => theme.spacings.lg} 0;
    font-family: ${({ theme }) => theme.fonts.body};
    line-height: 1.5;
    text-shadow: 0 2px 12px rgba(229,84,156,0.08);
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacings.md};
    max-width: 98vw;
    h1 {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
    p {
      font-size: ${({ theme }) => theme.fontSizes.md};
      padding: 0 5vw;
    }
  }
`;

const GradientTitle = styled.span`
  background: ${({ theme }) => theme.buttons.primary.background};
  -webkit-background-clip: text;
  color: ${({ theme }) => theme.buttons.primary.text};
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1.5px 1.5px #fbeaf0);
`;

const HeroDesc = styled.span`
  color: ${({ theme }) => theme.colors.whiteColor};
  font-weight: 500;
  text-shadow: 0 2px 14px #fbeaf0cc, 0 2px 16px #e5549c13;
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  @media (max-width: 900px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    padding: 0 5vw;
    max-width: 96vw;
    margin: 0 auto;
  }
`;


const CTAButton = styled.button`
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: 2.5px solid ${({ theme }) => theme.buttons.primary.background};
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  letter-spacing: 0.01em;
  margin-top: ${({ theme }) => theme.spacings.md};
  transition:
    background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    border-color ${({ theme }) => theme.transition.normal},
    transform 0.22s;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    border-color: ${({ theme }) => theme.buttons.primary.backgroundHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    text-decoration: none;
    transform: scale(1.037);
    outline: none;
  }

  &:active {
    background: ${({ theme }) => theme.colors.primaryDark};
    border-color: ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.white};
    transform: scale(0.98);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.opacity.disabled};
    border-color: ${({ theme }) => theme.colors.disabledBg};
    box-shadow: none;
  }
`;

const Dots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: center;
  align-items: center;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ theme }) => theme.spacings.lg};
  height: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  border: ${({ $active, theme }) =>
    $active ? `2.5px solid ${theme.colors.primaryDark}` : "none"};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.md : "none")};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTransparent};
    border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

// --- MODAL Styles ---
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 880px;
  width: 92vw;
  margin: 0 auto;
  padding: 2.2rem;
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const ModalImage = styled(Image)`
  width: 100%;
  height: 480px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: #fff;
  @media (max-width: 600px) {
    height: 200px;
    min-height: 120px;
    object-fit: contain;
  }
`;

const ModalCaption = styled.div`
  margin-top: 1.3em;
  text-align: center;
  h3 {
    font-size: 1.38em;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    margin-bottom: 0.2em;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.07em;
    font-weight: 400;
    margin: 0 auto;
    max-width: 420px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
`;
