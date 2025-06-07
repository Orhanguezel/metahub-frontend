"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices } from "@/modules/services/slice/servicesSlice";
import { Skeleton, ErrorMessage } from "@/shared";

export default function ServicesSection() {
  const { t, i18n } = useTranslation("services");
  const dispatch = useAppDispatch();
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { services, loading, error } = useAppSelector(
    (state) => state.services
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchServices(lang));
  }, [dispatch, lang]);

  if (!mounted) return null;

  const latestServices = services.slice(0, 3);

  return (
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>📰 {t("page.services.title")}</Title>

      {loading && (
        <Grid>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Grid>
      )}

      {!loading && error && <ErrorMessage />}

      {!loading && !error && (
        <>
          <Grid>
            {latestServices.map((item, index) => (
              <CardLink
                key={item._id}
                href={`/services/${item.slug}`}
                passHref
              >
                <Card
                  as={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <ImageWrapper>
                    {item.images?.[0]?.url ? (
                      <StyledImage
                        src={item.images[0].url}
                        alt={item.title?.[lang]}
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        viewport={{ once: true }}
                      />
                    ) : (
                      <ImagePlaceholder>
                        <span>📷</span>
                      </ImagePlaceholder>
                    )}
                  </ImageWrapper>
                  <Content>
                    <ServiceTitle>{item.title?.[lang]}</ServiceTitle>
                    <Excerpt>{item.summary?.[lang]}</Excerpt>
                  </Content>
                </Card>
              </CardLink>
            ))}
          </Grid>

          <SeeAll href="/services">{t("page.services.all")}</SeeAll>
        </>
      )}
    </Section>
  );
}

// Styled Components

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.02em;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xxl};
  justify-content: center;
  align-items: stretch;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
  transition: box-shadow 0.18s, transform 0.18s;
  min-height: 510px;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.xl}, 0 0 0 3px ${({ theme }) => theme.colors.primaryTransparent};
    transform: translateY(-5px) scale(1.025);
  }

  @media (max-width: 900px) {
    min-height: 410px;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  max-width: 440px;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.md} 0;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    max-width: 100%;
    aspect-ratio: 16/10;
    min-height: 180px;
  }
  @media (max-width: 767px) {
    aspect-ratio: 16/12;
    min-height: 140px;
    margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm} 0;
  }
`;

const StyledImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: transform 0.3s;
  display: block;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ServiceTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: ${({ theme }) => theme.spacing.md} 0 0 0;
  text-align: center;
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  max-width: 96%;
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  padding: 0.7em 1.8em;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryTransparent};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  letter-spacing: 0.01em;
  transition: background 0.18s, color 0.18s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
    text-decoration: none;
  }
`;
