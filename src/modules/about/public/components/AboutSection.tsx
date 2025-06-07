"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAbout } from "@/modules/about/slice/aboutSlice";

export default function AboutSection() {
  const { t, i18n } = useTranslation("about");
  const dispatch = useAppDispatch();

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { about, loading, error } = useAppSelector((state) => state.about);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchAbout(lang));
  }, [dispatch, lang]);

  if (!mounted || loading || error || about.length === 0) return null;

  const item = about[0]; // sadece ilk içerik gösterilecek
  const title = item.title?.[lang] || "";
  const content =
    item.shortDescription?.[lang] ||
    item.summary?.[lang] ||
    item.content?.[lang] ||
    "";

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

// Styled Components

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
