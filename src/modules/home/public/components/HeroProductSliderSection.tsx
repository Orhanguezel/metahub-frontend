"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchGalleryItemsByCategory } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight, FaExpand } from "react-icons/fa";
import SkeletonBox from "@/shared/Skeleton";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import Modal from "./Modal";

export default function HeroProductSliderSection() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.gallery);
  const [flatItems, setFlatItems] = useState<any[]>([]);
  const { i18n } = useTranslation();
  const currentLang = ["tr", "en", "de"].includes(i18n.language)
    ? i18n.language
    : "en";

  const { isOpen, open, close, next, prev, currentIndex, currentItem } =
    useModal(flatItems);

  useEffect(() => {
    dispatch(fetchGalleryItemsByCategory("hero"));
  }, [dispatch]);

  useEffect(() => {
    if (items.length > 0) {
      const merged = items.flatMap((item) => item.items || []);
      setFlatItems(merged);
    }
  }, [items]);

  useEffect(() => {
    if (flatItems.length === 0) return;
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [flatItems, next]);

  const handleSwipe = useCallback(
    (e: React.TouchEvent) => {
      const touchStartX = e.changedTouches[0].clientX;
      const touchEndHandler = (endEvent: TouchEvent) => {
        const touchEndX = endEvent.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) next();
        if (touchEndX - touchStartX > 50) prev();
        window.removeEventListener("touchend", touchEndHandler);
      };
      window.addEventListener("touchend", touchEndHandler);
    },
    [next, prev]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, next, prev]);

  if (loading) {
    return (
      <HeroContainer>
        <SkeletonBox style={{ height: "80px", marginBottom: "20px" }} />
        <SkeletonBox style={{ height: "400px", width: "100%" }} />
      </HeroContainer>
    );
  }

  if (flatItems.length === 0) {
    return <HeroContainer>No hero items found.</HeroContainer>;
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
            <button onClick={prev}>
              <FaArrowLeft />
            </button>
            <button onClick={next}>
              <FaArrowRight />
            </button>
            <button onClick={() => open(currentIndex)}>
              <FaExpand />
            </button>
          </ArrowControls>
        </HeroContent>

        <HeroImageWrapper>
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
        <div onTouchStart={handleSwipe} style={{ textAlign: "center" }}>
          <Image
            src={currentItem?.webp || currentItem?.image || "/placeholder.jpg"}
            alt={currentItem?.title?.[currentLang] || ""}
            width={1200}
            height={800}
            unoptimized
            sizes="100vw"
            style={{
              objectFit: "contain",
              maxHeight: "90vh",
              width: "auto",
            }}
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

// 🎨 Styled Components

const HeroContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  padding: 20px;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 700px;

  h2 {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ArrowControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 50%;
    padding: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 10px;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "gray"};
  border-radius: 50%;
`;
