"use client";

import { useMemo, useEffect } from "react";
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
import type { IGallery, IGalleryCategory } from "@/modules/gallery/types";

const SLIDER_CATEGORY_SLUG = "carousel";

const HeroSlider = () => {
  const { publicImages, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // --- Kategori ID seçimi ---
  const selectedCategoryId = useMemo(() => {
    if (!SLIDER_CATEGORY_SLUG || !Array.isArray(categories)) return "";
    const cat = categories.find((c: IGalleryCategory) => c.slug === SLIDER_CATEGORY_SLUG);
    return cat?._id || "";
  }, [categories]);

  // --- Görselleri düzleştir ---
  const flatItems = useMemo(() => {
    if (!selectedCategoryId || !Array.isArray(publicImages)) return [];
    const filteredGalleries = publicImages.filter((gallery: IGallery) =>
      typeof gallery.category === "string"
        ? gallery.category === selectedCategoryId
        : gallery.category?._id === selectedCategoryId
    );
    const allImages: any[] = [];
    filteredGalleries.forEach((gallery) => {
      (gallery.images || []).forEach((img) => {
        allImages.push({
          ...img,
          order: typeof img.order === "string" ? Number(img.order) : img.order ?? 0,
          _galleryId: gallery._id,
          category: gallery.category,
          type: gallery.type,
          tenant: gallery.tenant,
        });
      });
    });
    // Sırala: Küçükten büyüğe (order)
    allImages.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return allImages;
  }, [publicImages, selectedCategoryId]);

  // --- Modal Hook ---
  const { isOpen, open, close, next, prev, currentIndex, currentItem, setIndex } = useModal(flatItems);

  // --- Otomatik Slider ---
  useEffect(() => {
    if (flatItems.length === 0 || isOpen) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % flatItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [flatItems.length, setIndex, isOpen]);

  // --- Modal açıkken klavye ile sağ/sol/Esc ---
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

  // --- Loader ve empty ---
  if (loading) {
    return (
      <HeroWrapper>
        <SkeletonBox style={{ height: "60px", marginBottom: "24px" }} />
        <SkeletonBox style={{ height: "360px", width: "100%" }} />
      </HeroWrapper>
    );
  }

  if (flatItems.length === 0) {
    return <HeroWrapper>{t("noItemsFound", "No products found.")}</HeroWrapper>;
  }

  // --- Aktif görsel bilgisi ---
  const currentHero = flatItems[currentIndex];
  const title = currentHero?.name?.[lang] || currentHero?.name?.["en"] || "No title";
  const description = currentHero?.description?.[lang] || currentHero?.description?.["en"] || "No description";
  let imageSrc =
    currentHero?.webp ||
    currentHero?.url ||
    currentHero?.thumbnail ||
    "/placeholder.jpg";
  if (typeof imageSrc === "string" && imageSrc.startsWith("https://res.cloudinary.com/")) {
    imageSrc = `${imageSrc}?w=900&h=600&c_fill&q_auto,f_auto`;
  }

  const detailLink = currentHero?.productId
    ? `/ensotekprod/${currentHero.productId}`
    : `/ensotekprod`;

  return (
    <>
      <HeroWrapper>
        <ImageCol>
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
            {flatItems.map((_, index) => (
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
      <Modal
        isOpen={isOpen}
        onClose={close}
        onNext={next}
        onPrev={prev}
      >
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
              background: "#fff"
            }}
          />
          <ModalTitle>{currentItem?.name?.[lang]}</ModalTitle>
          <ModalDesc>{currentItem?.description?.[lang]}</ModalDesc>
          <DotRow style={{ marginTop: "10px" }}>
            {flatItems.map((_, index) => (
              <Dot key={index} $active={index === currentIndex} />
            ))}
          </DotRow>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HeroSlider;

// --- Styled Components ---
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
  left: 0; top: 0;
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
  border: 2.5px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.borderLight};
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
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.01em;
  margin-bottom: 2px;
  text-shadow: 0 3px 16px rgba(40,117,194,0.22);
`;

const HeroDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(30,80,160,0.09);
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
  text-shadow: 0 2px 10px rgba(30,80,160,0.08);
`;
