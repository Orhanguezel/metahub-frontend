"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchGalleryItemsByCategory } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useModal from "@/hooks/useModal";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";

export default function HeroSectionSlayt() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const currentLang = ["tr", "en", "de"].includes(i18n.language)
    ? i18n.language
    : "en";
  const { items, loading } = useAppSelector((state) => state.gallery);
  const [flatItems, setFlatItems] = useState<any[]>([]);
  const modal = useModal(flatItems);

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
      modal.next();
    }, 5000);
    return () => clearInterval(timer);
  }, [flatItems, modal.next]);

  const handleSwipe = useCallback(
    (e: React.TouchEvent) => {
      const touchStartX = e.changedTouches[0].clientX;
      const touchEndHandler = (endEvent: TouchEvent) => {
        const touchEndX = endEvent.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) modal.next();
        if (touchEndX - touchStartX > 50) modal.prev();
        window.removeEventListener("touchend", touchEndHandler);
      };
      window.addEventListener("touchend", touchEndHandler);
    },
    [modal.next, modal.prev]
  );

  if (loading || flatItems.length === 0) {
    return <HeroWrapper>Loading...</HeroWrapper>;
  }

  const heroItem = flatItems[modal.currentIndex];
  const title =
    heroItem?.title?.[currentLang] ||
    heroItem?.title?.en ||
    heroItem?.title?.tr ||
    "No title";
  const description =
    heroItem?.description?.[currentLang] ||
    heroItem?.description?.en ||
    heroItem?.description?.tr ||
    "No description";
  const imageSrc =
    heroItem?.webp ||
    heroItem?.image ||
    heroItem?.thumbnail ||
    "/placeholder.jpg";

  return (
    <>
      <HeroWrapper>
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
              <StyledImage src={imageSrc} alt={title} fill priority />
              <Overlay />
            </Background>
            <Content>
              <Title>{title}</Title>
              <Subtitle>{description}</Subtitle>
            </Content>
          </Slide>
        </AnimatePresence>

        <Nav>
          {flatItems.map((_, index) => (
            <Dot
              key={index}
              $active={index === modal.currentIndex}
              onClick={() => modal.open(index)}
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
        <div onTouchStart={handleSwipe} style={{ textAlign: "center" }}>
          <Image
            src={
              modal.currentItem?.webp ||
              modal.currentItem?.image ||
              modal.currentItem?.thumbnail ||
              "/placeholder.jpg"
            }
            alt={modal.currentItem?.title?.[currentLang] || ""}
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
          <h2 style={{ color: "white", marginTop: "10px" }}>
            {modal.currentItem?.title?.[currentLang]}
          </h2>
          <p style={{ color: "white" }}>
            {modal.currentItem?.description?.[currentLang]}
          </p>
        </div>
      </Modal>
    </>
  );
}

// 🎨 Styled Components

const HeroWrapper = styled.section`
  position: relative;
  width: 100%;
  height: 75vh;
  min-height: 500px;
  overflow: hidden;
  cursor: pointer;
`;

const Slide = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const StyledImage = styled(Image)`
  object-fit: cover;
  filter: brightness(0.6);
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.whiteColor};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const Nav = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  z-index: 3;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  transition: background 0.3s;
`;
