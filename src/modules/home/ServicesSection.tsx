"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.light};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: translateY(-4px);
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 160px;
  position: relative;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
  }
`;

export default function ServicesSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const services = [
    {
      image: "/services/aromatherapy.jpg",
      label: t("home.services.aromatherapy", "Aromaterapi Masajı"),
    },
    {
      image: "/services/reflexology.jpg",
      label: t("home.services.reflexology", "Refleksoloji"),
    },
    {
      image: "/services/deep-tissue.jpg",
      label: t("home.services.deepTissue", "Derin Doku Masajı"),
    },
    {
      image: "/services/anti-cellulite.jpg",
      label: t("home.services.antiCellulite", "Anti-selülit Masajı"),
    },
  ];

  return (
    <Section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>💆‍♀️ {t("home.services.title", "Hizmetlerimiz")}</Title>
      <Grid>
        {services.map((s, index) => (
          <Card
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ImageWrapper>
              <Image
                src={s.image}
                alt={s.label}
                fill
                style={{ objectFit: "cover" }}
              />
            </ImageWrapper>
            <Label>{s.label}</Label>
          </Card>
        ))}
      </Grid>
      <SeeAll href="/visitor/services">
        {t("home.services.all", "Tüm Hizmetleri Gör →")}
      </SeeAll>
    </Section>
  );
}
