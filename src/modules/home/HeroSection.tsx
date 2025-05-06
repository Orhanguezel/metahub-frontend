"use client";

import Link from "next/link";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const Hero = styled(motion.section)`
  position: relative;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  text-align: center;
  background: url("/hero.jpg") center/cover no-repeat;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.sm};
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
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.overlayStart },
    ${({ theme }) => theme.colors.overlayEnd }
  );
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes["xl"]};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const CTAButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: background-color ${({ theme }) => theme.transition.fast}, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function HeroSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // SSR/CSR uyumu
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
