"use client";

import Link from "next/link";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Section = styled(motion.section)`
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.sectionBackground || "#f5f5f5"};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
`;

const StyledButton = styled.a`
  padding: 12px 24px;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
  border-radius: 8px;
  font-weight: bold;
  text-decoration: none;
  margin: 0 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Ensotek Kühlturmsysteme</Title>
      <Subtitle>{t("subtitle", "Industrielle Kühlung auf höchstem Niveau.")}</Subtitle>

      <Link href="/visitor/products" passHref legacyBehavior>
        <StyledButton>🛠️ {t("viewProducts", "Produkte ansehen")}</StyledButton>
      </Link>

      <Link href="/visitor/appointment" passHref legacyBehavior>
        <StyledButton>🗓️ {t("scheduleMeeting", "Termin vereinbaren")}</StyledButton>
      </Link>
    </Section>
  );
}
