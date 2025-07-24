"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import type { SupportedLocale } from "@/types/common";
import type { IGallery, IGalleryCategory } from "@/modules/gallery/types";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/shared";

const SLIDER_CATEGORY_SLUG = "maintenance";

const HeroRobotic = () => {
  const { publicImages, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Kategori ID seçimi
  const selectedCategoryId = useMemo(() => {
    if (!SLIDER_CATEGORY_SLUG || !Array.isArray(categories)) return "";
    const cat = categories.find((c: IGalleryCategory) => c.slug === SLIDER_CATEGORY_SLUG);
    return cat?._id || "";
  }, [categories]);

  // Hero Gallery Seçimi
  const heroGallery: IGallery | undefined = useMemo(() => {
    if (!selectedCategoryId || !Array.isArray(publicImages)) return undefined;
    return publicImages.find((gallery: IGallery) =>
      typeof gallery.category === "string"
        ? gallery.category === selectedCategoryId
        : (gallery.category as IGalleryCategory)?._id === selectedCategoryId
    );
  }, [publicImages, selectedCategoryId]);

  // Hero İçerik
  const heroItem = heroGallery?.images?.[0];
  const title =
    heroItem?.name?.[lang] ||
    heroItem?.name?.["en"] ||
    (heroGallery?.category && typeof heroGallery.category !== "string"
      ? heroGallery.category.name?.[lang] || heroGallery.category.name?.["en"]
      : t("hero.title", "Empowering The Future With AI & Robotics"));

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

  // Loader / Empty
  if (loading) {
    return (
      <HeroSectionWrapper>
        <HeroContainer>
          <Content>
            <Skeleton style={{ height: "52px", marginBottom: "18px" }} />
            <Skeleton style={{ height: "26px", width: "60%" }} />
            <Skeleton style={{ height: "36px", width: "40%", marginTop: "12px" }} />
          </Content>
        </HeroContainer>
      </HeroSectionWrapper>
    );
  }
  if (!heroGallery || !heroItem) {
    return (
      <HeroSectionWrapper>
        <HeroContainer>
          <Content>{t("noItemsFound", "No hero found.")}</Content>
        </HeroContainer>
      </HeroSectionWrapper>
    );
  }

  return (
    <HeroSectionWrapper>
      <HeroContainer>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Actions>
            <CtaBtn as={Link} href={ctaHref}>{ctaLabel}</CtaBtn>
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
      </HeroContainer>
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
`;

const HeroContainer = styled.div`
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
    justify-content: center;
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
