"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { getCurrentLocale } from "@/utils/getCurrentLocale";

// --- Çoklu dil fallback fonksiyonu ---
function getBestTranslation<T extends Record<string, string>>(
  obj: T | undefined,
  lang: SupportedLocale
) {
  if (!obj) return "";
  if (obj[lang]) return obj[lang];
  for (const l of SUPPORTED_LOCALES) {
    if (obj[l]) return obj[l];
  }
  return "";
}

export default function AboutSection() {
  const { t } = useTranslation("about");
  const lang = getCurrentLocale();

  // Sadece store’dan oku (stateless!)
  const { about, loading, error } = useAppSelector((state) => state.about);

  if (loading || error || !about || about.length === 0) return null;

  const item = about[0]; // Sadece ilk içerik gösterilecek

  // Tüm çoklu dil alanlarında fallback uygula
  const title = getBestTranslation(item.title, lang);
  const content =
    getBestTranslation(item.shortDescription, lang) ||
    getBestTranslation(item.summary, lang) ||
    getBestTranslation(item.content, lang);

  return (
    <Section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <CardLink href={`/about/${item.slug}`} passHref>
        <Card>
          <Heading>🌿 {title}</Heading>
          <Paragraph>{content}</Paragraph>
          <DetailLink>{t("page.aboutLink", "More Info →")}</DetailLink>
        </Card>
      </CardLink>
    </Section>
  );
}

// --- Styled Components aynı kalabilir ---

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border-top: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  text-align: center;
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-block;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2rem 1.5rem;
  transition: transform ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const Heading = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const Paragraph = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const DetailLink = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
