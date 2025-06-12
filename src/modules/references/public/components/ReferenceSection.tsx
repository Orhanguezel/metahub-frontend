"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import type { IReference } from "@/modules/references/types/reference";

// --- Çoklu dil fallback helper ---
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

export default function ReferenceSection() {
  const { t } = useTranslation("reference");
  const lang = getCurrentLocale();

  // Sadece store consumption!
  const { references, loading, error } = useAppSelector(
    (state) => state.references
  );

  if (loading || error || !references || references.length === 0) return null;

  const item: IReference = references[0];
  const title = getBestTranslation(item.title, lang);
  const content =
    getBestTranslation((item as any).shortDescription, lang) ||
    getBestTranslation((item as any).summary, lang) ||
    getBestTranslation(item.content, lang) ||
    "";

  return (
    <Section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <CardLink href={`/references/${item.slug}`} passHref>
        <Card>
          <Heading>🌿 {title}</Heading>
          <Paragraph>{content}</Paragraph>
          <DetailLink>{t("page.ReferenceLink", "More Info →")}</DetailLink>
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
