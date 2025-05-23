"use client";

import Link from "next/link";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchGalleryItemsByCategory } from "@/modules/gallery/slice/gallerySlice";

export default function HeroSection() {
  const { t } = useTranslation("home");
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.gallery);
  const [flatItems, setFlatItems] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  //const currentLang = ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en";

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
      setCurrent((prev) => (prev + 1) % flatItems.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [flatItems]);

  const backgroundImage =
    flatItems[current]?.webp ||
    flatItems[current]?.image ||
    flatItems[current]?.thumbnail ||
    "/placeholder.jpg";

  return (
    <Hero>
      <AnimatePresence mode="wait">
        <BackgroundImageWrapper key={current}>
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 2, ease: [0.42, 0, 0.58, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={backgroundImage}
              alt="Hero Background"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </BackgroundImageWrapper>
      </AnimatePresence>
      <Overlay />
      <Content>
        <Title>{t("hero1.heroTitle", "Königs Masaj")}</Title>
        <Subtitle>
          {t(
            "hero1.heroSubtitle",
            "Doğallığın dokunuşuyla sağlığınızı şımartın"
          )}
        </Subtitle>
        <Link href="/visitor/appointment" passHref>
          <CTAButton>{t("hero1.cta", "🟣 Online Randevu Al")}</CTAButton>
        </Link>
      </Content>
    </Hero>
  );
}

const Hero = styled.section`
  position: relative;
  height: 70vh;
  min-height: 500px;
  width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 60vh;
    min-height: 400px;
  }
`;

const BackgroundImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
`;

const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};
  max-width: 800px;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["4xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const CTAButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: 2px solid ${({ theme }) => theme.colors.primaryHover};
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(0);
  }
`;
