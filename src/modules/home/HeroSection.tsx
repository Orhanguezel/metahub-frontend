"use client";

import Link from "next/link";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const Hero = styled(motion.section)`
  padding: 6rem 2rem;
  position: relative;
  color: ${({ theme }) => theme.text};
  background: url("/hero.jpg") center/cover no-repeat;
  text-align: center;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
    background-position: center;
  }
`;

const BackgroundImage = styled(Image)`
  z-index: 0;
  object-fit: cover;
  opacity: 0.2;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.95));
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary || "#555"};
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled.button`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.primary || "rebeccapurple"};
  color: ${({ theme }) => theme.buttonText || "#fff"};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover || "indigo"};
  }
`;

export default function HeroSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 🔒 SSR/CSR uyumu için
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Hero
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <BackgroundImage
        src="/hero.jpg" 
        alt="Hero Background"
        fill
        priority
      />
      <Overlay />
      <Content>
        <Title>{t("home.heroTitle", "Königs Masaj")}</Title>
        <Subtitle>{t("home.heroSubtitle", "Doğallığın dokunuşuyla sağlığınızı şımartın")}</Subtitle>
        <Link href="/visitor/appointment">
          <CTAButton>{t("home.cta", "🟣 Online Randevu Al")}</CTAButton>
        </Link>
      </Content>
    </Hero>
  );
}
