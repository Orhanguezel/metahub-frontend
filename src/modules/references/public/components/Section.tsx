"use client";

import styled from "styled-components";
import Link from "next/link";
import { translations } from "@/modules/references";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { FaUsers, FaGlobe, FaRegLightbulb, FaTrophy } from "react-icons/fa";

const YEARS_OF_EXPERIENCE = 40;
const PROJECTS_COUNT = 1200;
const COUNTRIES_COUNT = 12;

export default function ReferencesAchievementsSection() {
  const { i18n, t } = useI18nNamespace("references", translations);

  // i18n yüklemesi
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "references")) {
      i18n.addResourceBundle(lng, "references", resources, true, true);
    }
  });

  const references = useAppSelector((state) => state.references.references) || [];
  const referenceCount = references.length;

  const stats = [
    {
      icon: <FaUsers size={44} />,
      value: referenceCount > 0 ? `${referenceCount}+` : "—",
      label: t("stats.clients", "Mutlu Müşteri"),
    },
    {
      icon: <FaGlobe size={44} />,
      value: COUNTRIES_COUNT,
      label: t("stats.countries", "Ülkede Hizmet"),
    },
    {
      icon: <FaRegLightbulb size={44} />,
      value: PROJECTS_COUNT,
      label: t("stats.projects", "Teslimat / Proje"),
    },
    {
      icon: <FaTrophy size={44} />,
      value: YEARS_OF_EXPERIENCE,
      label: t("stats.experience", "Yıllık Tecrübe"),
    },
  ];

  return (
    <Section
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>{t("stats.title", "Başarılarımız")}</Title>
      <StatsGrid>
        {stats.map((item, i) => (
          <StatBox
            key={item.label}
            as={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.13 }}
          >
            <IconWrap>{item.icon}</IconWrap>
            <StatValue>{item.value}</StatValue>
            <StatLabel>{item.label}</StatLabel>
          </StatBox>
        ))}
      </StatsGrid>
      <SeeAll href="/references" passHref>
        {t("stats.allReferences", "Tüm Referanslarımızı Görün")}
      </SeeAll>
    </Section>
  );
}

// --- Styles ---
const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacings.xxl} 0 ${({ theme }) => theme.spacings.xl} 0;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.achievementGradientStart} 0%,
    ${({ theme }) => theme.colors.achievementGradientEnd} 100%
  );
  color: ${({ theme }) => theme.colors.white};
  text-align: center;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xl} 0 ${({ theme }) => theme.spacings.lg} 0;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  letter-spacing: 0.01em;
  color: ${({ theme }) => theme.colors.white};
  text-shadow: 0 2px 8px rgba(1,24,216,0.10);

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacings.lg};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto ${({ theme }) => theme.spacings.xl} auto;

  ${({ theme }) => theme.media.medium} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacings.lg};
  }

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;

const StatBox = styled.div`
  background: rgba(255,255,255,0.10);
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 38px 24px 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.23s, transform 0.19s;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.5px solid rgba(255,255,255,0.14);
  min-width: 0;
  min-height: 180px;

  &:hover {
    background: rgba(255,255,255,0.18);
    transform: translateY(-6px) scale(1.045);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const IconWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.white};
  filter: drop-shadow(0 1px 8px rgba(1,24,216,0.18));
  svg {
    display: block;
  }
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: 0.4rem;
  letter-spacing: 0.01em;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  letter-spacing: 0.01em;
  opacity: 0.96;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primaryDark};
  padding: 0.83rem 2.2rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-decoration: none;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  transition: background 0.19s, color 0.17s, box-shadow 0.19s;

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
    text-decoration: none;
  }
`;
