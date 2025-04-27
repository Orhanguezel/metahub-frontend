"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: 4rem 2rem;
  text-align: center;
  background: ${({ theme }) => theme.sectionBackground || "#f9f9f9"};
  color: ${({ theme }) => theme.text};
`;

const Heading = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.textSecondary || "#555"};
`;

const DetailLink = styled(Link)`
  font-weight: bold;
  color: ${({ theme }) => theme.primary || "rebeccapurple"};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default function AboutSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Heading>🌿 {t("home.aboutTitle", "Hakkımızda")}</Heading>
      <Paragraph>
        {t("home.aboutText", "Vücut, zihin ve ruh için doğal çözümler")}
      </Paragraph>
      <DetailLink href="/visitor/about">
        {t("home.aboutLink", "Detaylı Bilgi →")}
      </DetailLink>
    </Section>
  );
}
