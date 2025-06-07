"use client";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchPublishedGalleryItems,
  fetchPublishedGalleryCategories,
} from "@/modules/gallery/slice/gallerySlice";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight, FaExpand } from "react-icons/fa";
import SkeletonBox from "@/shared/Skeleton";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import Modal from "./Modal";
import Link from "next/link";

export default function HeroProductSliderSection() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.gallery);

  useEffect(() => {
    dispatch(fetchPublishedGalleryCategories());
  }, [dispatch]);

  useEffect(() => {
  if (!categories?.length) return;
  const massageTypesCat = categories.find(
    (cat) => cat.slug === "massage-types"
  );
  if (massageTypesCat?._id) {
    dispatch(
      fetchPublishedGalleryItems({ category: massageTypesCat._id })
    );
  }
}, [dispatch, categories]);


  const [flatItems, setFlatItems] = useState<any[]>([]);
  useEffect(() => {
    if (!items || !Array.isArray(items)) return setFlatItems([]);
    const flatted = items
      .map((item) =>
        item.items && item.items.length > 0
          ? {
              ...item.items[0],
              category: item.category,
              _galleryId: item._id,
            }
          : null
      )
      .filter(Boolean);
    setFlatItems(flatted);
  }, [items]);

  const { t, i18n } = useTranslation("home");
  const currentLang = ["tr", "en", "de"].includes(i18n.language)
    ? i18n.language
    : "en";
  const { isOpen, open, close, next, prev, currentIndex, currentItem } =
    useModal(flatItems);

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
    return <HeroContainer>No massage type items found.</HeroContainer>;
  }

  const currentHero = flatItems[currentIndex];
  const title = currentHero?.title?.[currentLang] || "No title";
  const description =
    currentHero?.description?.[currentLang] || "No description";
  const imageSrc =
    currentHero?.webp ||
    currentHero?.image ||
    currentHero?.thumbnail ||
    "/placeholder.jpg";

  return (
    <>
      <HeroContainer>
        <HeroContent>
          <h2>{title}</h2>
          <p>{description}</p>
          <ArrowControls>
            <SliderButton onClick={prev} aria-label="Önceki">
              <FaArrowLeft />
            </SliderButton>
            <SliderButton onClick={next} aria-label="Sonraki">
              <FaArrowRight />
            </SliderButton>
            <SliderButton onClick={() => open(currentIndex)} aria-label="Büyüt">
              <FaExpand />
            </SliderButton>
            <AppointmentButton as={Link} href="/booking">
              {t("hero.bookAppointment")}
            </AppointmentButton>
          </ArrowControls>
        </HeroContent>
        <HeroImageWrapper>
          <Image
            src={imageSrc}
            alt={title}
            width={800}
            height={450}
            unoptimized
            sizes="(max-width: 768px) 100vw, 70vw"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              borderRadius: "inherit",
              background: "#fff0f6",
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
            unoptimized
            sizes="(max-width: 768px) 100vw, 70vw"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              cursor: "pointer",
              borderRadius: "inherit",
              background: "#fff0f6",
            }}
            onClick={() => open(currentIndex)}
          />
          <h2 style={{ color: "white", marginTop: "10px" }}>
            {currentItem?.title?.[currentLang]}
          </h2>
          <p style={{ color: "white" }}>
            {currentItem?.description?.[currentLang]}
          </p>
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


const HeroContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 700px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-family: ${({ theme }) => theme.fonts.body};
  }
`;

const ArrowControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.buttons.primary.text};
    border: none;
    border-radius: ${({ theme }) => theme.radii.circle};
    padding: ${({ theme }) => theme.spacing.sm};
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
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  text-align: center;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: ${({ theme }) => theme.spacing.lg};
  height: ${({ theme }) => theme.spacing.lg};
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
  padding: ${({ theme }) => theme.spacing.sm};
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
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  margin-left: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal}, color ${({ theme }) => theme.transition.normal};

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    text-decoration: none;
  }

  @media ${({ theme }) => theme.media.mobile} {
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacing.md};
    width: 100%;
    justify-content: center;
  }
`;
