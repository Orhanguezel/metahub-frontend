"use client";

import Link from "next/link";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { IGallery, IGalleryCategory } from "@/modules/gallery/types";

// KATEGORİNİN _id’si veya slug’ı
const HERO_CATEGORY_SLUG = "carousel"; // veya ör: "hero_slider"
const HERO_CATEGORY_ID = ""; // Doldurmak istersen: "6878e89d260cf9b67f2c2101"

const HeroSection = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Hem gallery hem category slice’ı lazım!
  const { publicImages } = useAppSelector((state) => state.gallery);
  const galleryCategories = useAppSelector((state) => state.galleryCategory.categories);

  // Hangi kategorinin ID’si/slug’ı ile filtreleyeceksin?
  // Eğer slug ile çalışacaksan, ilgili kategorinin _id’sini bul:
  const selectedCategoryId = useMemo(() => {
    if (HERO_CATEGORY_ID) return HERO_CATEGORY_ID;
    if (HERO_CATEGORY_SLUG && Array.isArray(galleryCategories)) {
      const cat = galleryCategories.find((c: IGalleryCategory) => c.slug === HERO_CATEGORY_SLUG);
      return cat?._id || "";
    }
    return "";
  }, [galleryCategories]);

  // Kategoriye ait bütün gallery objelerini bul ve düzleştir
  const flatItems = useMemo(() => {
    if (!selectedCategoryId || !Array.isArray(publicImages)) return [];

    // Seçili kategoriye sahip gallery’leri bul
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


    // order’a göre sırala (küçükten büyüğe)
    allImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return allImages;
  }, [publicImages, selectedCategoryId]);

  const [current, setCurrent] = useState(0);
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
          <Link href="/booking">
            <CTAButton>{t("hero.bookAppointment", "Randevu Al")}</CTAButton>
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
    </Hero>
  );
};

export default HeroSection;

// Styled components ... (değişmedi)


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
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacings.xxl};

  @media ${({ theme }) => theme.media.mobile} {
    padding-bottom: ${({ theme }) => theme.spacings.xl};
  }
`;

const HeroCard = styled.div`
  background: rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xl}
    ${({ theme }) => theme.spacings.xxl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 620px;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};
  backdrop-filter: blur(2px);

  h1 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.extraBold};
    margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
    letter-spacings: 0.01em;
    line-height: 1.15;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.textLight};
    margin: 0 0 ${({ theme }) => theme.spacings.lg} 0;
    font-family: ${({ theme }) => theme.fonts.body};
    line-height: 1.4;
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    h1 {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
    p {
      font-size: ${({ theme }) => theme.fontSizes.md};
    }
  }
`;

const CTAButton = styled.button`
  padding: ${({ theme }) => theme.spacings.md}
    ${({ theme }) => theme.spacings.xl};
  background-color: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

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
