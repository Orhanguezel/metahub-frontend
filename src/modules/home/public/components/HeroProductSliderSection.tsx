"use client";

import { useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SupportedLocale } from "@/types/common";
import { FaArrowLeft, FaArrowRight, FaExpand } from "react-icons/fa";
import SkeletonBox from "@/shared/Skeleton";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import Modal from "./Modal";
import Link from "next/link";
import type { IGallery } from "@/modules/gallery/types";

export default function HeroProductSliderSection() {
  const { images, loading } = useAppSelector((state) => state.gallery);
 const { i18n, t } = useI18nNamespace("home", translations);
   const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // ✅ FlatItems doğrudan useMemo ile oluşturuluyor (her render'da değil, sadece images değişirse)
  const flatItems = useMemo(() => {
    if (!images || !Array.isArray(images)) return [];
    return images
      .map((gallery: IGallery) => {
        const firstImage = gallery.images?.[0];
        if (!firstImage) return null;
        return {
          ...firstImage,
          _galleryId: gallery._id,
          category: gallery.category,
          type: gallery.type,
          tenant: gallery.tenant,
        };
      })
      .filter(Boolean);
  }, [images]);

  // Modal ve slider state
  const { isOpen, open, close, next, prev, currentIndex, currentItem } = useModal(flatItems);

  // ✅ Sadece slider için timer effect (gerekli olan tek useEffect)
  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [flatItems, next]);

  if (loading) {
    return (
      <HeroContainer>
        <SkeletonBox style={{ height: "80px", marginBottom: "20px" }} />
        <SkeletonBox style={{ height: "400px", width: "100%" }} />
      </HeroContainer>
    );
  }

  if (flatItems.length === 0) {
    return <HeroContainer>{t("noItemsFound", "No items found.")}</HeroContainer>;
  }

  const currentHero = flatItems[currentIndex];
  const title = currentHero?.name?.[lang] || "No title";
  const description = currentHero?.description?.[lang] || "No description";
  let imageSrc =
    currentHero?.webp ||
    currentHero?.url ||
    currentHero?.thumbnail ||
    "/placeholder.jpg";

  // Cloudinary CDN optimizasyonu için query string eklemek istersen:
  if (imageSrc.startsWith("https://res.cloudinary.com/")) {
    imageSrc = `${imageSrc}?w=800&h=450&c_fill&q_auto,f_auto`;
  }

  return (
    <>
      <HeroContainer>
        <HeroContent>
          <h2>{title}</h2>
          <p>{description}</p>
          <ArrowControls>
            <SliderButton onClick={prev} aria-label="Previous">
              <FaArrowLeft />
            </SliderButton>
            <SliderButton onClick={next} aria-label="Next">
              <FaArrowRight />
            </SliderButton>
            <SliderButton onClick={() => open(currentIndex)} aria-label="Expand">
              <FaExpand />
            </SliderButton>
            <AppointmentButton as={Link} href="/booking">
              {t("hero.bookAppointment", "Book Appointment")}
            </AppointmentButton>
          </ArrowControls>
        </HeroContent>
        <HeroImageWrapper>
          <Image
            src={imageSrc}
            alt={title}
            width={800}
            height={450}
            priority={currentIndex === 0} // LCP boost!
            placeholder="blur"
            blurDataURL="/placeholder.jpg" // istersen base64 küçük bir image ile değiştir
            sizes="(max-width: 768px) 100vw, 70vw"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              borderRadius: "inherit",
            }}
            onClick={() => open(currentIndex)}
          />
          <Dots>
            {flatItems.map((_, index) => (
              <Dot key={index} $active={index === currentIndex} />
            ))}
          </Dots>
        </HeroImageWrapper>
      </HeroContainer>

      <Modal isOpen={isOpen} onClose={close} onNext={next} onPrev={prev}>
        <div style={{ textAlign: "center" }}>
          <Image
            src={imageSrc}
            alt={title}
            width={800}
            height={500}
            placeholder="blur"
            blurDataURL="/placeholder.jpg"
            sizes="(max-width: 768px) 100vw, 70vw"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              cursor: "pointer",
              borderRadius: "inherit",
            }}
            onClick={() => open(currentIndex)}
          />
          <h2 style={{ color: "white", marginTop: "10px" }}>
            {currentItem?.name?.[lang]}
          </h2>
          <p style={{ color: "white" }}>{currentItem?.description?.[lang]}</p>
          <Dots style={{ justifyContent: "center", marginTop: "10px" }}>
            {flatItems.map((_, index) => (
              <Dot key={index} $active={index === currentIndex} />
            ))}
          </Dots>
        </div>
      </Modal>
    </>
  );
}

// styled-components kodun aynen kalabilir!



const HeroContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.xxl};
  padding: ${({ theme }) => theme.spacings.xxl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: ${({ theme }) => theme.spacings.lg};
    padding: ${({ theme }) => theme.spacings.lg};
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 700px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacings.md};
    font-family: ${({ theme }) => theme.fonts.body};
  }
`;

const ArrowControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.md};

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.buttons.primary.text};
    border: none;
    border-radius: ${({ theme }) => theme.radii.circle};
    padding: ${({ theme }) => theme.spacings.sm};
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    box-shadow: ${({ theme }) => theme.shadows.button};
    cursor: pointer;
    transition: background ${({ theme }) => theme.transition.normal};

    &:hover {
      background: ${({ theme }) => theme.buttons.primary.backgroundHover};
      color: ${({ theme }) => theme.buttons.primary.textHover};
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  min-width: 320px;
  max-width: 650px;
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 1024px) {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.radii.lg};
    aspect-ratio: 16/9;
    min-width: 100%;
  }
`;

const Dots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.md};
  justify-content: center;
  text-align: center;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: ${({ theme }) => theme.spacings.lg};
  height: ${({ theme }) => theme.spacings.lg};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.sm : "none")};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.backgroundAlt};
  transition: background ${({ theme }) => theme.transition.normal};
`;

const SliderButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  padding: ${({ theme }) => theme.spacings.sm};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const AppointmentButton = styled.a`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  margin-left: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    text-decoration: none;
  }

  @media ${({ theme }) => theme.media.mobile} {
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacings.md};
    width: 100%;
    justify-content: center;
  }
`;
