"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations, Modal } from "@/modules/home";
import { SupportedLocale } from "@/types/common";
import SkeletonBox from "@/shared/Skeleton";
import type { IGallery} from "@/modules/gallery/types";

const SLIDER_CATEGORY_SLUG = "carousel";

type GalleryItem = IGallery["images"][0] & {
  _galleryId?: string;
  category?: any;
};

const HeroSectionSlayt = () => {
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { publicImages } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);

  // Burada kategori objesini bul
  const targetCategory = useMemo(
    () => categories?.find((cat) => cat.slug === SLIDER_CATEGORY_SLUG),
    [categories]
  );

  // Flat + order sıralı ve sadece ilgili kategoriden
  const flatItems = useMemo<GalleryItem[]>(() => {
    if (!Array.isArray(publicImages) || !targetCategory) return [];
    const filtered = publicImages.filter((gallery) =>
      typeof gallery.category === "string"
        ? gallery.category === targetCategory._id
        : gallery.category?._id === targetCategory._id
    );
    // Bütün galerilerdeki bütün resimleri düzleştirip, parent galleryId ekle ve sırala
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
    // order'a göre sıralama (default 0)
    allImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return allImages;
  }, [publicImages, targetCategory]);

  const modal = useModal(flatItems);

  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => modal.next(), 5000);
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

  if (!publicImages || !categories) {
    return (
      <HeroWrapper>
        <SkeletonBox style={{ height: "60px", marginBottom: "24px" }} />
        <SkeletonBox style={{ height: "360px", width: "100%" }} />
      </HeroWrapper>
    );
  }

  if (flatItems.length === 0) {
    return <HeroWrapper>{t("noItemsFound", "No slider items found.")}</HeroWrapper>;
  }

  const heroItem = flatItems[modal.currentIndex];
  const title =
    heroItem?.name?.[lang]?.trim() ||
    t("hero1.heroTitle", "Königs Masaj");

  const description =
    heroItem?.description?.[lang]?.trim() ||
    t("hero1.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın");

  const imageSrc =
    heroItem?.webp || heroItem?.url || heroItem?.thumbnail || "/placeholder.jpg";

  return (
    <>
      <HeroWrapper onTouchStart={handleSwipe}>
        <AnimatePresence mode="wait">
          <Slide
            key={modal.currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => modal.open(modal.currentIndex)}
          >
            <Background>
              <StyledImage
                src={imageSrc}
                alt={title || "Slider image"}
                fill
                priority
              />
              <Overlay />
            </Background>
            <Content>
              <Title>{title}</Title>
              <Subtitle>{description}</Subtitle>
            </Content>
          </Slide>
        </AnimatePresence>
        <Nav>
          {flatItems.map((_, idx) => (
            <Dot
              key={idx}
              $active={idx === modal.currentIndex}
              onClick={() => modal.open(idx)}
            />
          ))}
        </Nav>
      </HeroWrapper>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onNext={modal.next}
        onPrev={modal.prev}
      >
        <div style={{ textAlign: "center" }}>
          <Image
            src={imageSrc}
            alt={title || "Slider detail image"}
            width={1200}
            height={800}
            unoptimized
            sizes="100vw"
            style={{
              objectFit: "contain",
              maxHeight: "80vh",
              width: "auto",
              borderRadius: "12px",
            }}
          />
          <h2 style={{ color: "#fff", marginTop: "10px" }}>{title}</h2>
          <p style={{ color: "#fff" }}>{description}</p>
        </div>
      </Modal>
    </>
  );
};

export default HeroSectionSlayt;



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
`;

const Slide = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 320px;
  min-height: 220px;
  max-height: 400px;
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
`;

const Background = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const StyledImage = styled(Image)`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: center;
  display: block;
  filter: brightness(0.7);
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.02) 0%,
    rgba(0,0,0,0.38) 100%
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
  padding: 32px 16px;
  background: rgba(0,0,0,0.28);
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  @media (max-width: 768px) {
    padding: 20px 6px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    max-width: 96vw;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5em;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0;
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
  border: none;
  cursor: pointer;
  transition: background 0.3s;
`;
